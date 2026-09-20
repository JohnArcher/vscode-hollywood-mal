import { basename, dirname, extname } from 'path';
import { commands, Disposable, TextDocument, window } from 'vscode';
import {
  compileFlagArguments, ERROR_CODE_ARGUMENTS, readHollywoodSettings, warnAboutMissingExePath
} from '../configuration';
import { HOLLYWOOD_LANGUAGE_ID } from '../hollywoodWorkspace';
import { runInHollywoodTerminal } from '../terminal';

/**
 * Runs and compiles the file in the active editor.
 *
 * These exist alongside the provided tasks because Visual Studio Code cannot show tasks
 * while no folder is open (microsoft/vscode#40515, #115678) — which is exactly the
 * single-file situation where "just run this script" is most useful. Commands have no
 * such restriction, and they can be bound to a key without depending on a task name.
 */

export const RUN_CURRENT_FILE_COMMAND = 'hollywood.runCurrentFile';
export const COMPILE_CURRENT_FILE_COMMAND = 'hollywood.compileCurrentFile';


/**
 * Returns the saved document of the active editor, or undefined with an explanation.
 * Running an unsaved buffer would execute the previous contents, which is confusing.
 */
async function activeHollywoodDocument(): Promise<TextDocument | undefined> {
  const editor = window.activeTextEditor;
  if (!editor) {
    window.showWarningMessage('Open a Hollywood script first.');
    return undefined;
  }
  const document = editor.document;
  if (document.languageId !== HOLLYWOOD_LANGUAGE_ID) {
    window.showWarningMessage('The active file is not a Hollywood script.');
    return undefined;
  }
  if (document.isUntitled) {
    window.showWarningMessage('Save the script to a file before running it.');
    return undefined;
  }
  if (document.isDirty && !await document.save()) {
    window.showWarningMessage('The script could not be saved, so it was not started.');
    return undefined;
  }
  return document;
}

async function execute(mode: 'run' | 'compile'): Promise<void> {
  const document = await activeHollywoodDocument();
  if (!document) {
    return;
  }

  const settings = readHollywoodSettings(document.uri);
  if (!settings.exePath) {
    warnAboutMissingExePath({ scope: document.uri });
    return;
  }

  const file = document.uri.fsPath;
  const folder = dirname(file);
  const name = basename(file);

  if (mode === 'run') {
    runInHollywoodTerminal(settings.exePath, [name, '-printerror', ...ERROR_CODE_ARGUMENTS], folder);
    return;
  }

  const exetype = settings.outputExeType;
  if (!exetype) {
    window.showWarningMessage('No output format configured. Set "hollywood.outputExeType" to compile.');
    return;
  }
  const output = basename(name, extname(name));
  runInHollywoodTerminal(
    settings.exePath,
    [name, '-compile', output, '-exetype', exetype, ...compileFlagArguments(settings), ...ERROR_CODE_ARGUMENTS],
    folder
  );
}

export function registerCurrentFileCommands(): Disposable {
  return Disposable.from(
    commands.registerCommand(RUN_CURRENT_FILE_COMMAND, () => execute('run')),
    commands.registerCommand(COMPILE_CURRENT_FILE_COMMAND, () => execute('compile'))
  );
}
