import { basename, dirname, extname } from 'path';
import {
  commands, Disposable, Extension, QuickPickItem, Uri, window, workspace, WorkspaceFolder
} from 'vscode';
import {
  compileFlagArguments, compileOptionsSummary, ERROR_CODE_ARGUMENTS, readHollywoodSettings,
  warnAboutMissingExePath
} from '../configuration';
import { HOLLYWOOD_LANGUAGE_ID } from '../hollywoodWorkspace';
import { log } from '../log';
import { runInHollywoodTerminal } from '../terminal';

/**
 * Compiles for one or more targets picked on the spot.
 *
 * The equivalent of the *Create executable* dialog of the official Hollywood IDE, whose
 * main element is a list of platforms to tick. Visual Studio Code has no form dialogs —
 * webviews are explicitly discouraged for this — and the native counterpart of a checkbox
 * list is a multi-select quick pick, which is what this command opens.
 *
 * Everything else that dialog holds is a setting here: `hollywood.mainOutputFile` is its
 * base name, `hollywood.compress` and `hollywood.consoleMode` its two switches.
 */
export const COMPILE_TO_COMMAND = 'hollywood.compileTo';

/** Separates several targets in one `-exetype` argument, e.g. `win64|classic|morphos`. */
const TARGET_SEPARATOR = '|';

interface TargetItem extends QuickPickItem {
  target: string;
}

/**
 * The targets, read from the extension's own manifest.
 *
 * `hollywood.outputExeType` already lists every platform with a readable description, so
 * taking them from there keeps one source instead of a copy that drifts.
 */
function readTargets(extension: Extension<unknown>): TargetItem[] {
  const contributed = extension.packageJSON?.contributes?.configuration;
  const categories = Array.isArray(contributed) ? contributed : [contributed];

  for (const category of categories) {
    const property = category?.properties?.['hollywood.outputExeType'];
    if (!property?.enum) {
      continue;
    }
    const targets: TargetItem[] = property.enum.map((target: string, index: number) => ({
      target,
      // packageJSON is untyped, so a missing description would slip through as undefined
      // and show as an empty row.
      label: property.enumDescriptions?.[index] ?? target,
      description: target
    }));

    // Ordered by the readable name in `label`, not by the technical value, so the list
    // reads like the target list of the official Hollywood IDE. Sorting by the value
    // would scatter the platforms, which is how they sit in the manifest.
    return targets.sort((a, b) =>
      (a.label ?? a.target).localeCompare(b.label ?? b.target, undefined, { sensitivity: 'base' })
    );
  }
  return [];
}

/** What to compile: the project's main file, or else whatever is open. */
interface CompileSubject {
  /** Passed to the compiler, relative to `cwd`. */
  source: string;
  /** Name of the generated program, without extension. */
  output: string;
  cwd: string | undefined;
  /**
   * Whose settings apply. For the project that is its folder, for a single script the
   * script itself — the same scope "Compile current file" uses, so both commands pick the
   * same compiler for the same file in a multi-root workspace.
   */
  scope: WorkspaceFolder | Uri | undefined;
}

function findSubject(): CompileSubject | undefined {
  const folder = workspace.workspaceFolders?.[0];
  const settings = readHollywoodSettings(folder);

  if (settings.mainFile && settings.mainOutputFile) {
    return {
      source: settings.mainFile,
      output: settings.mainOutputFile,
      cwd: folder?.uri.fsPath,
      scope: folder
    };
  }

  // No project configured — fall back to the open file, so the command also works on a
  // single script, just like "Compile current file".
  const document = window.activeTextEditor?.document;
  if (document?.languageId === HOLLYWOOD_LANGUAGE_ID && !document.isUntitled) {
    const file = document.uri.fsPath;
    return {
      source: basename(file),
      output: basename(file, extname(file)),
      cwd: dirname(file),
      scope: document.uri
    };
  }

  window.showWarningMessage(
    'Nothing to compile. Set "hollywood.mainFile" and "hollywood.mainOutputFile", or open a Hollywood script.'
  );
  return undefined;
}

async function compileTo(extension: Extension<unknown>): Promise<void> {
  const targets = readTargets(extension);
  if (!targets.length) {
    log().error('Could not read the target list from the extension manifest.');
    return;
  }

  const subject = findSubject();
  if (!subject) {
    return;
  }

  const settings = readHollywoodSettings(subject.scope);
  if (!settings.exePath) {
    warnAboutMissingExePath({ scope: subject.scope });
    return;
  }

  // Start from what is configured, so confirming without changing anything compiles the
  // same targets a plain compile task would.
  const configured = new Set((settings.outputExeType ?? '').split(TARGET_SEPARATOR));
  const selected = await window.showQuickPick(
    targets.map(item => ({ ...item, picked: configured.has(item.target) })),
    {
      canPickMany: true,
      // The compile switches apply to this build but live in the settings, so they are
      // named here, where the decision is actually made.
      title: `Compile ${subject.source} with ${settings.compiler} · ${compileOptionsSummary(settings)}`,
      placeHolder: 'Pick one or more target platforms'
    }
  );
  if (!selected?.length) {
    return;
  }

  const exetype = selected.map(item => item.target).join(TARGET_SEPARATOR);
  log().info(`Compiling ${subject.source} for ${exetype}.`);
  runInHollywoodTerminal(
    settings.exePath,
    [subject.source, '-compile', subject.output, '-exetype', exetype,
      ...compileFlagArguments(settings), ...ERROR_CODE_ARGUMENTS],
    subject.cwd
  );
}

export function registerCompileToCommand(extension: Extension<unknown>): Disposable {
  return commands.registerCommand(COMPILE_TO_COMMAND, () => compileTo(extension));
}
