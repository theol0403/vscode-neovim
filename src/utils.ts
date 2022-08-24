import { workspace, TextEditor, TextDocumentContentChangeEvent, Position, TextDocument, EndOfLine } from "vscode";
import wcwidth from "ts-wcwidth";
import { NeovimClient } from "neovim";
import { calcPatch } from "fast-myers-diff";

import { Logger } from "./logger";

export const EXT_NAME = "vscode-neovim";
export const EXT_ID = `asvetliakov.${EXT_NAME}`;

export type GridLineEvent = [number, number, number, [string, number, number][]];

export function calcDiffWithPosition(
    oldText: string,
    newText: string,
    eol: string,
): Array<[Position, Position, string, number]> {
    const splitText = oldText.split(eol);
    const diff: Array<[Position, Position, string, number]> = [];
    const patch = calcPatch(oldText, newText);
    for (const change of patch) {
        const lineStart = oldText.slice(0, change[0]).split(eol).length - 1;
        const lineEnd = oldText.slice(0, change[1]).split(eol).length - 1;
        const charStart =
            lineStart > 0 ? change[0] - (splitText.slice(0, lineStart).join(eol).length + eol.length) : change[0];
        const charEnd =
            lineEnd > 0 ? change[1] - (splitText.slice(0, lineEnd).join(eol).length + eol.length) : change[1];
        diff.push([
            new Position(lineStart, charStart),
            new Position(lineEnd, charEnd),
            change[2],
            change[1] - change[0],
        ]);
    }
    return diff;
}

function getBytesFromCodePoint(point?: number): number {
    if (point == null) {
        return 0;
    }
    if (point <= 0x7f) {
        return 1;
    }
    if (point <= 0x7ff) {
        return 2;
    }
    if (point >= 0xd800 && point <= 0xdfff) {
        // Surrogate pair: These take 4 bytes in UTF-8 and 2 chars in UCS-2
        return 4;
    }
    if (point < 0xffff) {
        return 3;
    }
    return 4;
}

export function convertCharNumToByteNum(line: string, col: number): number {
    if (col === 0 || !line) {
        return 0;
    }

    let currCharNum = 0;
    let totalBytes = 0;
    while (currCharNum < col) {
        // VIM treats 2 bytes as 1 char pos for grid_cursor_goto/grid_lines (https://github.com/asvetliakov/vscode-neovim/issues/127)
        // but for setting cursor we must use original byte length
        const bytes = getBytesFromCodePoint(line.codePointAt(currCharNum));
        totalBytes += bytes;
        currCharNum++;
        if (currCharNum >= line.length) {
            return totalBytes;
        }
    }
    return totalBytes;
}

export function convertByteNumToCharNum(line: string, col: number): number {
    let totalBytes = 0;
    let currCharNum = 0;
    while (totalBytes < col) {
        if (currCharNum >= line.length) {
            return currCharNum + (col - totalBytes);
        }
        totalBytes += getBytesFromCodePoint(line.codePointAt(currCharNum));
        currCharNum++;
    }
    return currCharNum;
}

export function calculateEditorColFromVimScreenCol(
    line: string,
    screenCol: number,
    tabSize = 1,
    useBytes = false,
): number {
    if (screenCol === 0 || !line) {
        return 0;
    }
    let currentCharIdx = 0;
    let currentVimCol = 0;
    while (currentVimCol < screenCol) {
        currentVimCol +=
            line[currentCharIdx] === "\t"
                ? tabSize - (currentVimCol % tabSize)
                : useBytes
                ? getBytesFromCodePoint(line.codePointAt(currentCharIdx))
                : wcwidth(line[currentCharIdx]);

        currentCharIdx++;
        if (currentCharIdx >= line.length) {
            return currentCharIdx;
        }
    }
    return currentCharIdx;
}

type LegacySettingName = "neovimPath" | "neovimInitPath";
type SettingPrefix = "neovimExecutablePaths" | "neovimInitVimPaths"; //this needs to be aligned with setting names in package.json
type Platform = "win32" | "darwin" | "linux";

function getSystemSpecificSetting(
    settingPrefix: SettingPrefix,
    legacySetting: { environmentVariableName?: "NEOVIM_PATH"; vscodeSettingName: LegacySettingName },
): string | undefined {
    const settings = workspace.getConfiguration(EXT_NAME);
    const isUseWindowsSubsystemForLinux = settings.get("useWSL");

    //https://github.com/microsoft/vscode/blob/master/src/vs/base/common/platform.ts#L63
    const platform = process.platform as "win32" | "darwin" | "linux";

    const legacyEnvironmentVariable =
        legacySetting.environmentVariableName && process.env[legacySetting.environmentVariableName];

    //some system specific settings can be loaded from process.env and value from env will override setting value
    const legacySettingValue = legacyEnvironmentVariable || settings.get(legacySetting.vscodeSettingName);
    if (legacySettingValue) {
        return legacySettingValue;
    } else if (isUseWindowsSubsystemForLinux && platform === "win32") {
        return settings.get(`${settingPrefix}.${"linux" as Platform}`);
    } else {
        return settings.get(`${settingPrefix}.${platform}`);
    }
}

export function getNeovimPath(): string | undefined {
    const legacySettingInfo = {
        vscodeSettingName: "neovimPath",
        environmentVariableName: "NEOVIM_PATH",
    } as const;
    return getSystemSpecificSetting("neovimExecutablePaths", legacySettingInfo);
}

export function getNeovimInitPath(): string | undefined {
    const legacySettingInfo = {
        vscodeSettingName: "neovimInitPath",
    } as const;
    return getSystemSpecificSetting("neovimInitVimPaths", legacySettingInfo);
}

export function editorPositionToNeovimPosition(editor: TextEditor, position: Position): [number, number] {
    const lineText = editor.document.lineAt(position.line).text;
    const byteCol = convertCharNumToByteNum(lineText, position.character);
    return [position.line + 1, byteCol];
}

export function getNeovimCursorPosFromEditor(editor: TextEditor): [number, number] {
    try {
        return editorPositionToNeovimPosition(editor, editor.selection.active);
    } catch {
        return [1, 0];
    }
}

export function getDocumentLineArray(doc: TextDocument): string[] {
    const eol = doc.eol === EndOfLine.CRLF ? "\r\n" : "\n";
    return doc.getText().split(eol);
}

export function normalizeInputString(str: string, wrapEnter = true): string {
    let finalStr = str.replace(/</g, "<LT>");
    if (wrapEnter) {
        finalStr = finalStr.replace(/\n/g, "<CR>");
    }
    return finalStr;
}

export function findLastEvent(name: string, batch: [string, ...unknown[]][]): [string, ...unknown[]] | undefined {
    for (let i = batch.length - 1; i >= 0; i--) {
        const [event] = batch[i];
        if (event === name) {
            return batch[i];
        }
    }
}

/**
 * Wrap nvim callAtomic and check for any errors in result
 * @param client
 * @param requests
 * @param logger
 * @param prefix
 */
export async function callAtomic(
    client: NeovimClient,
    requests: [string, unknown[]][],
    logger: Logger,
    prefix = "",
): Promise<void> {
    const res = await client.callAtomic(requests);
    const errors: string[] = [];
    if (res && Array.isArray(res) && Array.isArray(res[0])) {
        res[0].forEach((res, idx) => {
            if (res) {
                const call = requests[idx];
                const requestName = call?.[0];
                if (requestName !== "nvim_input") {
                    errors.push(`${call?.[0] || "Unknown"}: ${res}`);
                }
            }
        });
    }
    if (errors.length) {
        logger.error(`${prefix}:\n${errors.join("\n")}`);
    }
}
