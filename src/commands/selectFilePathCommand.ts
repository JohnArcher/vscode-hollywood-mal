import { commands, Disposable, window, workspace } from 'vscode';

/**
 * Inserts the path of a workspace file at the cursor, for filling in an `@INCLUDE`.
 *
 * Prototype, bound to alt+L. Only triggers when the cursor sits between the two quotes of
 * an `@INCLUDE` line; the eventual goal is proper path completion while typing.
 * TODO: implement ready
 */
export const SELECT_FILE_PATH_COMMAND = 'extension.selectFilePath';

const INCLUDE_KEYWORD = '@INCLUDE';
const SOURCE_FILE_GLOB = '**/*.{hws,hwa}';

async function selectFilePath(): Promise<void> {
  const editor = window.activeTextEditor;
  if (!editor) {
    return;
  }

  const cursor = editor.selection.start;
  const line = editor.document.lineAt(cursor.line);
  if (!line.text.includes(INCLUDE_KEYWORD)) {
    return;
  }

  // Only offer the list where the path belongs: between the two quotes.
  const charBeforeCursor = line.text.charAt(cursor.character - 1);
  const charAfterCursor = line.text.charAt(cursor.character);
  if (charBeforeCursor !== '"' || charAfterCursor !== '"') {
    return;
  }

  const files = await workspace.findFiles(SOURCE_FILE_GLOB);
  const selected = await window.showQuickPick(
    files.map(file => workspace.asRelativePath(file.fsPath))
  );
  if (!selected) {
    return;
  }

  // Read the editor again: picking from the list may have moved the focus.
  const target = window.activeTextEditor;
  if (!target) {
    return;
  }
  await target.edit(builder => builder.insert(target.selection.start, selected));
}

export function registerSelectFilePathCommand(): Disposable {
  return commands.registerCommand(SELECT_FILE_PATH_COMMAND, selectFilePath);
}
