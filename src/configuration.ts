import { Uri, workspace, WorkspaceFolder } from 'vscode';
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
}

/**
 * Strips surrounding double quotes from a configured path.
 *
 * Up to version 10 the documentation told users to quote paths containing spaces, which
 * was right for shell tasks — the shell removed them again. The compiler is now started
 * directly, where a quote would become part of the file name, so such a path has to be
 * cleaned up rather than silently failing to start.
 */
export function unquotePath(value: string | undefined): string | undefined {
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
    outputExeType: config.get<string>('outputExeType') || undefined
  };
}

/** Name of the setting holding the executable for the selected compiler. */
export function exePathSettingName(compiler: string): string {
  return compiler === MINIWOOD ? 'hollywood.miniwoodExePath' : 'hollywood.exePath';
}
