import { commands, ConfigurationTarget, Disposable, window, workspace } from 'vscode';
import { HOLLYWOOD, MINIWOOD, warnAboutMissingExePath } from '../configuration';
import { log } from '../log';

/**
 * Lets the user pick the compiler to run and compile with.
 *
 * Nothing acts on the choice here — it is written to `hollywood.compiler`, and the status
 * bar and the task provider each react to that setting changing.
 */
export const SWITCH_COMPILER_COMMAND = 'hollywood.switchHollywoodMiniwood';

async function switchCompiler(): Promise<void> {
  const config = workspace.getConfiguration('hollywood');
  const current = config.get<string>('compiler') ?? HOLLYWOOD;

  const selected = await window.showQuickPick([HOLLYWOOD, MINIWOOD], {
    placeHolder: `Select the compiler to run and compile with (currently ${current})`
  });
  if (!selected || selected === current) {
    return;
  }

  // The setting is meant per project, but without an open workspace there is nowhere to
  // put it — fall back to the user settings instead of letting the update throw.
  const target = workspace.workspaceFolders?.length
    ? ConfigurationTarget.Workspace
    : ConfigurationTarget.Global;

  try {
    await config.update('compiler', selected, target);
  } catch (error) {
    log().error(`Could not save the compiler selection: ${error}`);
    window.showErrorMessage(`Could not save the compiler selection: ${error}`);
    return;
  }

  log().info(`Compiler switched to ${selected}.`);
  warnAboutMissingExePath();
}

export function registerSwitchCompilerCommand(): Disposable {
  return commands.registerCommand(SWITCH_COMPILER_COMMAND, switchCompiler);
}
