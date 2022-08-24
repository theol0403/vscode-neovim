import { calcPatch } from "fast-myers-diff";
import { NeovimClient } from "neovim";
import {
    Disposable,
    EndOfLine,
    Position,
    ProgressLocation,
    Range,
    Selection,
    TextDocument,
    TextDocumentChangeEvent,
    window,
    workspace,
} from "vscode";
import { Mutex } from "async-mutex";

import { BufferManager } from "./buffer_manager";
import { Logger } from "./logger";
import { ModeManager } from "./mode_manager";
import { NeovimExtensionRequestProcessable } from "./neovim_events_processable";
import { callAtomic, convertCharNumToByteNum, getDocumentLineArray } from "./utils";
import { getNeovimCursor } from "./test/utils";

const LOG_PREFIX = "DocumentChangeManager";

export class DocumentChangeManager implements Disposable, NeovimExtensionRequestProcessable {
    private disposables: Disposable[] = [];
    /**
     * Array of pending events to apply in batch
     * ! vscode text editor operations are async and can't be executed in parallel.
     * ! We can execute them synchronously by awaiting each change but it will be very slow
     * ! So group buffer changes within 50ms and execute them in batch
     */
    private pendingEvents: Array<Parameters<NonNullable<BufferManager["onBufferEvent"]>>> = [];
    /**
     * Buffer skipping update map
     * ! Since neovim change will trigger onDocumentChangeEvent we need to handle it and don't send a change again
     * ! For it we optimistically increase skipTicks for each change originated from vscode and check it in neovim buffer event handler
     */
    private bufferSkipTicks: Map<number, number> = new Map();
    /**
     * Document version tracking
     * ! Same as previous property, but reverse
     */
    private documentSkipVersionOnChange: WeakMap<TextDocument, number> = new WeakMap();
    /**
     * Pending document changes promise. Being set early when first change event for a document is received
     * ! Since operations are async it's possible we receive other updates (such as cursor, HL) for related editors with document before
     * ! text change will be applied. In this case we need to queue such changes (through .then()) and wait for change operation completion
     */
    private textDocumentChangePromise: Map<
        TextDocument,
        Array<{ promise?: Promise<void>; resolve?: () => void; reject?: () => void }>
    > = new Map();
    /**
     * Stores cursor pos after document change in neovim
     */
    private cursorAfterTextDocumentChange: WeakMap<TextDocument, { line: number; character: number }> = new WeakMap();
    /**
     * Holds document content last known to neovim.
     * ! This is used to convert vscode ranges to neovim bytes.
     * ! It's possible to just fetch content from neovim and check instead of tracking here, but this will add unnecessary lag
     */
    private documentContentInNeovim: WeakMap<TextDocument, string> = new WeakMap();
    /**
     * True when we're currently applying edits, so incoming changes will go into pending events queue
     */
    private applyingEdits = false;
    /**
     * Lock edits being sent to neovim
     */
    private documentChangeLock: Mutex = new Mutex();

    public constructor(
        private logger: Logger,
        private client: NeovimClient,
        private bufferManager: BufferManager,
        private modeManager: ModeManager,
    ) {
        this.bufferManager.onBufferEvent = this.onNeovimChangeEvent;
        this.bufferManager.onBufferInit = this.onBufferInit;
        this.disposables.push(workspace.onDidChangeTextDocument(this.onChangeTextDocument));
    }

    public dispose(): void {
        this.disposables.forEach((d) => d.dispose());
    }

    public eatDocumentCursorAfterChange(doc: TextDocument): { line: number; character: number } | undefined {
        const cursor = this.cursorAfterTextDocumentChange.get(doc);
        this.cursorAfterTextDocumentChange.delete(doc);
        return cursor;
    }

    public getDocumentChangeCompletionLock(doc: TextDocument): Promise<void[]> | undefined {
        const promises = this.textDocumentChangePromise.get(doc);
        if (!promises || !promises.length) {
            return;
        }
        return Promise.all(promises.map((p) => p.promise).filter(Boolean));
    }

    public hasDocumentChangeCompletionLock(doc: TextDocument): boolean {
        return (this.textDocumentChangePromise.get(doc)?.length || 0) > 0;
    }

    public async handleExtensionRequest(): Promise<void> {
        // skip
    }

    private onBufferInit: BufferManager["onBufferInit"] = (id, doc) => {
        this.logger.debug(`${LOG_PREFIX}: Init buffer content for bufId: ${id}, uri: ${doc.uri.toString()}`);
        this.documentContentInNeovim.set(doc, doc.getText());
    };

    private onNeovimChangeEvent: BufferManager["onBufferEvent"] = (
        bufId,
        tick,
        firstLine,
        lastLine,
        linedata,
        more,
    ) => {
        this.logger.debug(`${LOG_PREFIX}: Received neovim buffer changed event for bufId: ${bufId}, tick: ${tick}`);
        const doc = this.bufferManager.getTextDocumentForBufferId(bufId);
        if (!doc) {
            this.logger.debug(`${LOG_PREFIX}: No text document for buffer: ${bufId}`);
            return;
        }
        const skipTick = this.bufferSkipTicks.get(bufId) || 0;
        if (skipTick >= tick) {
            this.logger.debug(`${LOG_PREFIX}: BufId: ${bufId} skipping tick: ${tick}`);
            return;
        }
        // happens after undo
        if (firstLine === lastLine && linedata.length === 0) {
            this.logger.debug(`${LOG_PREFIX}: BufId: ${bufId} empty change, skipping`);
            return;
        }
        if (!this.textDocumentChangePromise.has(doc)) {
            this.textDocumentChangePromise.set(doc, []);
        }
        const documentPromises = this.textDocumentChangePromise.get(doc)!;
        const promiseDesc: { promise?: Promise<void>; resolve?: () => void; reject?: () => void } = {};
        promiseDesc.promise = new Promise<void>((res, rej) => {
            promiseDesc.resolve = res;
            promiseDesc.reject = rej;
        });
        // put default catch block so promise reject won't be unhandled
        promiseDesc.promise.catch((err) => {
            this.logger.error(err);
        });
        documentPromises.push(promiseDesc);

        this.pendingEvents.push([bufId, tick, firstLine, lastLine, linedata, more]);
        if (!this.applyingEdits) {
            this.applyEdits();
        }
    };

    private applyEdits = async (): Promise<void> => {
        this.applyingEdits = true;
        this.logger.debug(`${LOG_PREFIX}: Applying neovim edits`);
        // const edits = this.pendingEvents.splice(0);
        let resolveProgress: undefined | (() => void);
        const progressTimer = setTimeout(() => {
            window.withProgress<void>(
                { location: ProgressLocation.Notification, title: "Applying neovim edits" },
                () => new Promise((res) => (resolveProgress = res)),
            );
        }, 1000);

        while (this.pendingEvents.length) {
            const newTextByDoc: Map<TextDocument, string[]> = new Map();
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            let edit = this.pendingEvents.shift();
            while (edit) {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const [bufId, _tick, firstLine, lastLine, data, _more] = edit;
                const doc = this.bufferManager.getTextDocumentForBufferId(bufId);
                if (!doc) {
                    this.logger.warn(`${LOG_PREFIX}: No document for ${bufId}, skip`);
                    continue;
                }
                this.logger.debug(`${LOG_PREFIX}: Accumulating edits for ${doc.uri.toString()}, bufId: ${bufId}`);
                if (!newTextByDoc.get(doc)) {
                    newTextByDoc.set(doc, getDocumentLineArray(doc));
                }
                let lines = newTextByDoc.get(doc)!;
                // nvim sends following:
                // 1. string change - firstLine is the changed line , lastLine + 1
                // 2. cleaned line but not deleted - first line is the changed line, lastLine + 1, linedata is ""
                // 3. newline insert - firstLine = lastLine and linedata is "" or new data
                // 4. line deleted - firstLine is changed line, lastLine + 1, linedata is empty []
                // 5. multiple empty lines deleted (sometimes happens), firstLine is changedLine - shouldn't be deleted, lastLine + 1, linedata is ""
                // LAST LINE is exclusive and can be out of the last editor line
                if (firstLine !== lastLine && lastLine === firstLine + 1 && data.length === 1 && data[0] === "") {
                    // 2
                    for (let line = firstLine; line < lastLine; line++) {
                        lines[line] = "";
                    }
                } else if (firstLine !== lastLine && data.length === 1 && data[0] === "") {
                    // 5
                    for (let line = 1; line < lastLine - firstLine; line++) {
                        lines.splice(firstLine, 1);
                    }
                    lines[firstLine] = "";
                } else if (firstLine !== lastLine && !data.length) {
                    // 4
                    for (let line = 0; line < lastLine - firstLine; line++) {
                        lines.splice(firstLine, 1);
                    }
                } else if (firstLine === lastLine) {
                    // 3
                    if (firstLine > lines.length) {
                        data.unshift("");
                    }
                    if (firstLine === 0) {
                        lines.unshift(...data);
                    } else {
                        lines = [...lines.slice(0, firstLine), ...data, ...lines.slice(firstLine)];
                    }
                } else {
                    // 1 or 3
                    // handle when change is overflow through editor lines. E.g. pasting on last line.
                    // Without newline it will append to the current one
                    if (firstLine >= lines.length) {
                        data.unshift("");
                    }
                    lines = [...lines.slice(0, firstLine), ...data, ...lines.slice(lastLine)];
                }
                newTextByDoc.set(doc, lines);
                edit = this.pendingEvents.shift();
            }
            // replacing lines with WorkspaceEdit() moves cursor to the end of the line, unfortunately this won't work
            // const workspaceEdit = new vscode.WorkspaceEdit();
            for (const [doc, newLines] of newTextByDoc) {
                const lastPromiseIdx = this.textDocumentChangePromise.get(doc)?.length || 0;
                try {
                    this.logger.debug(`${LOG_PREFIX}: Applying edits for ${doc.uri.toString()}`);
                    if (doc.isClosed) {
                        this.logger.debug(`${LOG_PREFIX}: Document was closed, skippnig`);
                        continue;
                    }
                    const editor = window.visibleTextEditors.find((e) => e.document === doc);
                    if (!editor) {
                        this.logger.debug(`${LOG_PREFIX}: No visible text editor for document, skipping`);
                        continue;
                    }
                    const oldText = doc.getText();
                    const eol = doc.eol === EndOfLine.CRLF ? "\r\n" : "\n";
                    const newText = newLines.join(eol);
                    const splitText = oldText.split(eol);

                    const changes = Array.from(calcPatch(oldText, newText));
                    if (!changes.length) continue;
                    this.documentSkipVersionOnChange.set(doc, doc.version + 1);

                    const cursorBefore = editor.selection.active;
                    const success = await editor.edit(
                        (builder) => {
                            for (const change of changes) {
                                const lineStart = oldText.slice(0, change[0]).split(eol).length - 1;
                                const lineEnd = oldText.slice(0, change[1]).split(eol).length - 1;
                                const charStart =
                                    lineStart > 0
                                        ? change[0] - (splitText.slice(0, lineStart).join(eol).length + eol.length)
                                        : change[0];
                                const charEnd =
                                    lineEnd > 0
                                        ? change[1] - (splitText.slice(0, lineEnd).join(eol).length + eol.length)
                                        : change[1];
                                if (change[0] === change[1]) {
                                    builder.insert(new Position(lineStart, charStart), change[2]);
                                } else if (change[2] === "") {
                                    builder.delete(new Range(lineStart, charStart, lineEnd, charEnd));
                                } else {
                                    builder.replace(new Range(lineStart, charStart, lineEnd, charEnd), change[2]);
                                }
                            }
                        },
                        { undoStopAfter: false, undoStopBefore: false },
                    );
                    const docPromises = this.textDocumentChangePromise.get(doc)?.splice(0, lastPromiseIdx) || [];
                    if (success) {
                        if (!editor.selection.anchor.isEqual(editor.selection.active)) {
                            editor.selections = [new Selection(editor.selection.active, editor.selection.active)];
                        } else {
                            // Some editor operations change cursor position. This confuses cursor
                            // sync from Vim to Code (e.g. when cursor did not change in Vim but
                            // changed in Code). Fix by forcing cursor position to stay the same
                            // indepent of the diff operation in question.
                            editor.selections = [new Selection(cursorBefore, cursorBefore)];
                        }
                        this.cursorAfterTextDocumentChange.set(editor.document, {
                            line: editor.selection.active.line,
                            character: editor.selection.active.character,
                        });
                        docPromises.forEach((p) => p.resolve && p.resolve());
                        this.logger.debug(`${LOG_PREFIX}: Changes successfully applied for ${doc.uri.toString()}`);
                        this.documentContentInNeovim.set(doc, doc.getText());
                    } else {
                        docPromises.forEach((p) => {
                            p.promise?.catch(() =>
                                this.logger.warn(`${LOG_PREFIX}: Edit was canceled for doc: ${doc.uri.toString()}`),
                            );
                            p.reject && p.reject();
                        });
                        this.logger.warn(`${LOG_PREFIX}: Changes were not applied for ${doc.uri.toString()}`);
                    }
                } catch (e) {
                    this.logger.error(`${LOG_PREFIX}: Error applying neovim edits, error: ${(e as Error).message}`);
                }
            }
        }
        const promises = [...this.textDocumentChangePromise.values()].flatMap((p) => p);
        this.textDocumentChangePromise.clear();
        promises.forEach((p) => p.resolve && p.resolve());
        // better to be safe - if event was inserted after exit the while() block but before exit the function
        if (progressTimer) {
            clearTimeout(progressTimer);
        }
        if (resolveProgress) {
            resolveProgress();
        }
        if (this.pendingEvents.length) {
            this.applyEdits();
        }
        this.applyingEdits = false;
    };

    private onChangeTextDocument = async (e: TextDocumentChangeEvent): Promise<void> => {
        await this.documentChangeLock.runExclusive(async () => await this.onChangeTextDocumentLocked(e));
    };

    private onChangeTextDocumentLocked = async (e: TextDocumentChangeEvent): Promise<void> => {
        const { document: doc, contentChanges } = e;

        this.logger.debug(`${LOG_PREFIX}: Change text document for uri: ${doc.uri.toString()}`);
        if (this.documentSkipVersionOnChange.get(doc) === doc.version) {
            this.logger.debug(`${LOG_PREFIX}: Skipping a change since versions equals`);
            return;
        }
        if (!contentChanges.length) {
            this.logger.debug(`${LOG_PREFIX}: Skipping a change since no content changes`);
            return;
        }

        const origText = this.documentContentInNeovim.get(doc);
        if (origText == null) {
            this.logger.warn(`${LOG_PREFIX}: Can't get last known neovim content for ${doc.uri.toString()}, skipping`);
            return;
        }

        const bufId = this.bufferManager.getBufferIdForTextDocument(doc);
        if (!bufId) {
            this.logger.warn(`${LOG_PREFIX}: No neovim buffer for ${doc.uri.toString()}`);
            return;
        }

        this.documentContentInNeovim.set(doc, doc.getText());

        const requests: [string, unknown[]][] = [];
        const eol = doc.eol === EndOfLine.LF ? "\n" : "\r\n";

        const bufTick: number = await this.client.request("nvim_buf_get_changedtick", [bufId]);
        if (!bufTick) {
            this.logger.warn(`${LOG_PREFIX}: Can't get changed tick for bufId: ${bufId}, deleted?`);
            return;
        }

        let newTicks = 0;

        for (const change of contentChanges) {
            const start = change.range.start;
            const end = change.range.end;

            // vscode indexes by character, but neovim indexes by byte
            const startBytes = convertCharNumToByteNum(origText.split(eol)[start.line], start.character);
            const endBytes = convertCharNumToByteNum(origText.split(eol)[end.line], end.character);

            if (change.rangeLength === 0 && this.modeManager.isInsertMode) {
                requests.push(["nvim_input", [change.text]]);
                newTicks += change.text.length;
            } else if (change.text.length === 0 && this.modeManager.isInsertMode) {
                const neovimCursor = await getNeovimCursor(this.client);
                const cursor = new Position(neovimCursor[0], neovimCursor[1]);
                if (end.isBeforeOrEqual(cursor)) {
                    // we deleted using backspace
                    requests.push(["nvim_input", ["<BS>".repeat(change.rangeLength)]]);
                } else {
                    // we deleted using delete
                    requests.push(["nvim_input", ["<Del>".repeat(change.rangeLength)]]);
                }
                newTicks += change.rangeLength;
            } else {
                requests.push([
                    "nvim_buf_set_text",
                    [bufId, start.line, startBytes, end.line, endBytes, change.text.split(eol)],
                ]);
                newTicks++;
            }
        }

        this.logger.debug(
            `${LOG_PREFIX}: BufId: ${bufId}, newTicks: ${newTicks}, tick: ${bufTick}, skipTick: ${bufTick + newTicks}`,
        );
        this.bufferSkipTicks.set(bufId, bufTick + newTicks);

        if (requests.length) await callAtomic(this.client, requests, this.logger, LOG_PREFIX);
    };
}
