import { commands, Uri, window, workspace, WorkspaceFolder } from 'vscode';
import { log } from './log';

/** The compilers the extension can drive, matching the `hollywood.compiler` setting. */
export const HOLLYWOOD = 'Hollywood';
export const MINIWOOD = 'Miniwood';

/** Settings the provided tasks and the current-file commands are built from. */
export interface HollywoodSettings {
  /** Either `Hollywood` or `Miniwood`. */
  compiler: string;
  /** Executable of the selected compiler, quotes already removed. */
  exePath?: string;
  mainFile?: string;
  mainOutputFile?: string;
  outputExeType?: string;
  /** Compress the generated executable, especially worthwhile with Miniwood. */
  compress: boolean;
  /** Compile a console program — the replacement for the removed *console exe types. */
  consoleMode: boolean;
}

/**
 * Makes Hollywood report failure through its exit code.
 *
 * By default Hollywood returns 0 even after printing an error, so a terminal or a task
 * would always look successful. Added to every invocation, running and compiling alike.
 */
export const ERROR_CODE_ARGUMENTS = ['-errorcode', '1'];

/**
 * "compression: on · console mode: off" — the state of the two compile switches in words.
 *
 * They apply to every build but live in the settings, out of sight at the moment they
 * matter. The picker and the status bar both show this, from one wording.
 */
export function compileOptionsSummary(settings: HollywoodSettings): string {
  const onOff = (enabled: boolean) => (enabled ? 'on' : 'off');
  return `compression: ${onOff(settings.compress)} · console mode: ${onOff(settings.consoleMode)}`;
}

/**
 * The switches that change how an executable is built, in the order the official Hollywood
 * IDE lists them. Compile-time only: they have no meaning when running a script.
 */
export function compileFlagArguments(settings: HollywoodSettings): string[] {
  const flags: string[] = [];
  if (settings.compress) {
    flags.push('-compress');
  }
  if (settings.consoleMode) {
    flags.push('-consolemode');
  }
  return flags;
}

/**
 * Strips surrounding double quotes from a configured path.
 *
 * Up to version 10 the documentation told users to quote paths containing spaces, which
 * was right for shell tasks — the shell removed them again. The compiler is now started
 * directly, where a quote would become part of the file name, so such a path has to be
 * cleaned up rather than silently failing to start.
 */
function unquotePath(value: string | undefined): string | undefined {
  if (!value) {
    return undefined;
  }
  const cleaned = value.trim().replace(/^"+|"+$/g, '').trim();
  if (cleaned !== value.trim()) {
    log().info(`Removed quotes from the configured path: ${value} -> ${cleaned}`);
  }
  return cleaned || undefined;
}

/** Reads the configuration and picks the executable matching the selected compiler. */
export function readHollywoodSettings(scope?: WorkspaceFolder | Uri): HollywoodSettings {
  const uri = scope && 'uri' in scope ? scope.uri : scope;
  const config = workspace.getConfiguration('hollywood', uri);
  const compiler = config.get<string>('compiler') ?? HOLLYWOOD;
  return {
    compiler,
    exePath: unquotePath(config.get<string>(compiler === MINIWOOD ? 'miniwoodExePath' : 'exePath')),
    mainFile: config.get<string>('mainFile') || undefined,
    mainOutputFile: config.get<string>('mainOutputFile') || undefined,
    outputExeType: config.get<string>('outputExeType') || undefined,
    compress: config.get<boolean>('compress') ?? false,
    consoleMode: config.get<boolean>('consoleMode') ?? false
  };
}

/** Name of the setting holding the executable for the selected compiler. */
function exePathSettingName(compiler: string): string {
  return compiler === MINIWOOD ? 'hollywood.miniwoodExePath' : 'hollywood.exePath';
}

let missingExePathWarned = false;

/**
 * Warns that the executable for the selected compiler is not configured, and offers to
 * jump straight to the setting. Nothing can run or compile without it, so both the tasks
 * and the current-file commands end up here.
 *
 * @param once  Suppress repeats. The task list is fetched often, so the warning triggered
 *              by an empty list must not pile up; a deliberate user action always warns.
 * @param scope Document or folder whose settings apply, for multi-root workspaces.
 */
export function warnAboutMissingExePath(
  { once, scope }: { once?: boolean; scope?: WorkspaceFolder | Uri } = {}
): void {
  const settings = readHollywoodSettings(scope ?? workspace.workspaceFolders?.[0]);
  if (settings.exePath) {
    missingExePathWarned = false;
    return;
  }
  if (once && missingExePathWarned) {
    return;
  }
  missingExePathWarned = true;

  const setting = exePathSettingName(settings.compiler);
  log().warn(`${settings.compiler} executable not configured (${setting}).`);

  const openSettings = 'Open Settings';
  window.showWarningMessage(
    `No ${settings.compiler} executable configured. Set "${setting}" to run or compile scripts.`,
    openSettings
  ).then(choice => {
    if (choice === openSettings) {
      commands.executeCommand('workbench.action.openSettings', setting);
    }
  });
}
