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
import { NeovimExtensionRequestProcessable } from "./neovim_events_processable";
import {
    accumulateDotRepeatChange,
    calcDiffWithPosition,
    callAtomic,
    convertCharNumToByteNum,
    DotRepeatChange,
    getDocumentLineArray,
    isChangeSubsequentToChange,
    isCursorChange,
    normalizeDotRepeatChange,
} from "./utils";
import { MainController } from "./main_controller";

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
    private cursorAfterTextDocumentChange: WeakMap<TextDocument, Position> = new WeakMap();
    /**
     * Holds document content last known to neovim.
     * ! This is used to convert vscode ranges to neovim bytes.
     * ! It's possible to just fetch content from neovim and check instead of tracking here, but this will add unnecessary lag
     */
    private documentContentInNeovim: WeakMap<TextDocument, string> = new WeakMap();
    /**
     * Dot repeat workaround
     */
    private dotRepeatChange: DotRepeatChange | undefined;
    /**
     * True when we're currently applying edits, so incoming changes will go into pending events queue
     */
    private applyingEdits = false;
    /**
     * Lock edits being sent to neovim
     */
    private documentChangeLock: Mutex = new Mutex();

    public constructor(private logger: Logger, private client: NeovimClient, private main: MainController) {
        this.main.bufferManager.onBufferEvent = this.onNeovimChangeEvent;
        this.main.bufferManager.onBufferInit = this.onBufferInit;
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

    public async syncDotRepeatWithNeovim(): Promise<void> {
        // dot-repeat executes last change across all buffers. So we'll create a temporary buffer & window,
        // replay last changes here to trick neovim and destroy it after
        if (!this.dotRepeatChange) {
            return;
        }
        this.logger.debug(`${LOG_PREFIX}: Syncing dot repeat`);
        const dotRepeatChange = { ...this.dotRepeatChange };
        this.dotRepeatChange = undefined;

        const currWin = await this.client.window;

        // temporary buffer to replay the changes
        const buf = await this.client.createBuffer(false, true);
        if (typeof buf === "number") {
            return;
        }
        // create temporary win
        await this.client.setOption("eventignore", "BufWinEnter,BufEnter,BufLeave");
        const win = await this.client.openWindow(buf, true, {
            external: true,
            width: 100,
            height: 100,
        });
        await this.client.setOption("eventignore", "");
        if (typeof win === "number") {
            return;
        }
        const edits: [string, unknown[]][] = [];

        // for delete changes we need an actual text, so let's prefill with something
        // accumulate all possible lengths of deleted text to be safe
        const delRangeLength = dotRepeatChange.rangeLength;
        if (delRangeLength) {
            const stub = new Array(delRangeLength).fill("x").join("");
            edits.push(
                ["nvim_buf_set_lines", [buf.id, 0, 0, false, [stub]]],
                ["nvim_win_set_cursor", [win.id, [1, delRangeLength]]],
            );
        }
        let editStr = "";
        if (dotRepeatChange.rangeLength) {
            editStr += [...new Array(dotRepeatChange.rangeLength).keys()].map(() => "<BS>").join("");
        }
        editStr += dotRepeatChange.text.split(dotRepeatChange.eol).join("\n").replace("<", "<LT>");
        edits.push(["nvim_input", [editStr]]);
        // since nvim_input is not blocking we need replay edits first, then clean up things in subsequent request
        await callAtomic(this.client, edits, this.logger, LOG_PREFIX);

        const cleanEdits: [string, unknown[]][] = [];
        cleanEdits.push(["nvim_set_current_win", [currWin.id]]);
        cleanEdits.push(["nvim_win_close", [win.id, true]]);
        await callAtomic(this.client, cleanEdits, this.logger, LOG_PREFIX);
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
        const doc = this.main.bufferManager.getTextDocumentForBufferId(bufId);
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
        let resolveProgress: undefined | (() => void);
        const progressTimer = setTimeout(() => {
            window.withProgress<void>(
                { location: ProgressLocation.Notification, title: "Applying neovim edits" },
                () => new Promise((res) => (resolveProgress = res)),
            );
        }, 1000);

        let edit = this.pendingEvents.shift();
        while (edit) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const [bufId, _tick, firstLine, lastLine, data, _more] = edit;
            const doc = this.main.bufferManager.getTextDocumentForBufferId(bufId);
            if (!doc) {
                this.logger.warn(`${LOG_PREFIX}: No document for ${bufId}, skip`);
                continue;
            }
            const editor = window.visibleTextEditors.find((e) => e.document === doc);
            if (!editor) {
                this.logger.debug(`${LOG_PREFIX}: No visible text editor for document, skipping`);
                continue;
            }
            this.logger.debug(`${LOG_PREFIX}: Accumulating edits for ${doc.uri.toString()}, bufId: ${bufId}`);
            // nvim sends following:
            // 1. string change - firstLine is the changed line , lastLine + 1
            // 2. cleaned line but not deleted - first line is the changed line, lastLine + 1, linedata is ""
            // 3. newline insert - firstLine = lastLine and linedata is "" or new data
            // 4. line deleted - firstLine is changed line, lastLine + 1, linedata is empty []
            // 5. multiple empty lines deleted (sometimes happens), firstLine is changedLine - shouldn't be deleted, lastLine + 1, linedata is ""
            // LAST LINE is exclusive and can be out of the last editor line
            const success = await editor.edit(
                (builder) => {
                    if (firstLine === lastLine) {
                        // 3.
                        if (firstLine >= doc.lineCount) {
                            builder.insert(new Position(firstLine, 0), "\n" + data.join("\n"));
                        } else {
                            builder.insert(new Position(firstLine, 0), data.join("\n") + "\n");
                        }
                    } else if (firstLine !== lastLine && !data.length) {
                        // 4.
                        builder.delete(new Range(firstLine, 0, lastLine, 0));
                        if (lastLine >= doc.lineCount) {
                            builder.delete(new Range(firstLine - 1, 999999, firstLine, 0));
                        }
                    } else {
                        const changes = calcDiffWithPosition(
                            doc.getText(new Range(firstLine, 0, lastLine - 1, 999999)),
                            data.join("\n"),
                        );
                        for (const change of changes) {
                            builder.replace(
                                new Range(change.start.translate(firstLine, 0), change.end.translate(firstLine, 0)),
                                change.text,
                            );
                        }
                    }
                    this.documentSkipVersionOnChange.set(doc, doc.version + 1);
                },
                { undoStopAfter: false, undoStopBefore: true }, // turn off
            );
            if (success) {
                const neovimCursorPos =
                    this.main.cursorManager.neovimCursorPosition.get(editor) ?? editor.selection.active;
                this.cursorAfterTextDocumentChange.set(editor.document, neovimCursorPos);
                editor.selection = new Selection(neovimCursorPos, neovimCursorPos);
                this.logger.debug(`${LOG_PREFIX}: Changes successfully applied for ${doc.uri.toString()}`);
                this.documentContentInNeovim.set(doc, doc.getText());
            } else {
                this.logger.warn(`${LOG_PREFIX}: Changes were not applied for ${doc.uri.toString()}`);
            }
            edit = this.pendingEvents.shift();
        }
        this.textDocumentChangePromise.forEach((p) => p.forEach((p) => p.resolve?.()));
        this.textDocumentChangePromise.clear();
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

        const bufId = this.main.bufferManager.getBufferIdForTextDocument(doc);
        if (!bufId) {
            this.logger.warn(`${LOG_PREFIX}: No neovim buffer for ${doc.uri.toString()}`);
            return;
        }

        const origText = this.documentContentInNeovim.get(doc);
        if (origText == null) {
            this.logger.warn(`${LOG_PREFIX}: Can't get last known neovim content for ${doc.uri.toString()}, skipping`);
            return;
        }
        this.documentContentInNeovim.set(doc, doc.getText());

        const eol = doc.eol === EndOfLine.LF ? "\n" : "\r\n";
        const activeEditor = window.activeTextEditor;

        // Store dot repeat
        if (activeEditor && activeEditor.document === doc && this.main.modeManager.isInsertMode) {
            const cursor = activeEditor.selection.active;
            for (const change of contentChanges) {
                if (isCursorChange(change, cursor, eol)) {
                    if (this.dotRepeatChange && isChangeSubsequentToChange(change, this.dotRepeatChange)) {
                        this.dotRepeatChange = accumulateDotRepeatChange(change, this.dotRepeatChange);
                    } else {
                        this.dotRepeatChange = normalizeDotRepeatChange(change, eol);
                    }
                }
            }
        }

        const requests: [string, unknown[]][] = [];

        for (const c of contentChanges) {
            const start = c.range.start;
            const end = c.range.end;
            const text = c.text;
            // vscode indexes by character, but neovim indexes by byte
            // count the number of bytes in the line to get the neovim index
            const startBytes = convertCharNumToByteNum(origText.split(eol)[start.line], start.character);
            const endBytes = convertCharNumToByteNum(origText.split(eol)[end.line], end.character);
            requests.push(["nvim_buf_set_text", [bufId, start.line, startBytes, end.line, endBytes, text.split(eol)]]);
        }

        const bufTick: number = await this.client.request("nvim_buf_get_changedtick", [bufId]);
        if (!bufTick) {
            this.logger.warn(`${LOG_PREFIX}: Can't get changed tick for bufId: ${bufId}, deleted?`);
            return;
        }
        this.logger.debug(
            `${LOG_PREFIX}: BufId: ${bufId}, lineChanges: ${requests.length}, tick: ${bufTick}, skipTick: ${
                bufTick + requests.length
            }`,
        );
        this.bufferSkipTicks.set(bufId, bufTick + requests.length);

        this.logger.debug(`${LOG_PREFIX}: Setting wantInsertCursorUpdate to false`);
        this.main.cursorManager.wantInsertCursorUpdate = false;
        if (requests.length) await callAtomic(this.client, requests, this.logger, LOG_PREFIX);
    };
}
