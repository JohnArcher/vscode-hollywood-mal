import { Disposable, MarkdownString, StatusBarAlignment, StatusBarItem, window, workspace } from "vscode";
import { compileOptionsSummary, HOLLYWOOD, readHollywoodSettings } from "../configuration";
import { hollywoodWorkspace } from "../hollywoodWorkspace";

/**
 * Shows the selected compiler in the status bar and acts as the entry point for switching
 * between Hollywood and Miniwood.
 *
 * The item reflects the settings rather than being told what to display, so it stays
 * correct even when they are edited directly in settings.json. It only appears in
 * Hollywood workspaces: the extension can be activated in any project merely by someone
 * opening the task list, and a Hollywood item has no business in a foreign one.
 */

/** A change to any of these changes what the item says. */
const WATCHED_SETTINGS = [
  "hollywood.compiler",
  "hollywood.compress",
  "hollywood.consoleMode"
];

export class StatusBarProvider implements Disposable {

  private statusBarItem: StatusBarItem;
  private subscriptions: Disposable[] = [];

  constructor(switchCommand: string) {
    this.statusBarItem = window.createStatusBarItem(StatusBarAlignment.Right, 100);
    this.statusBarItem.name = "Hollywood Compiler";
    this.statusBarItem.command = switchCommand;
    this.update();

    this.subscriptions.push(
      workspace.onDidChangeConfiguration(event => {
        if (WATCHED_SETTINGS.some(setting => event.affectsConfiguration(setting))) {
          this.update();
        }
      }),
      hollywoodWorkspace().onDidChange(() => this.updateVisibility())
    );

    this.updateVisibility();
  }

  /**
   * Refreshes label and tooltip.
   *
   * Only the compiler goes into the label: the status bar is shared by every extension,
   * and the guidelines ask for short text. The compile switches, which apply to every
   * build, go into the tooltip instead of crowding the bar.
   */
  update() {
    const settings = readHollywoodSettings(workspace.workspaceFolders?.[0]);
    const compiler = settings.compiler || HOLLYWOOD;

    this.statusBarItem.text = `$(tools) ${compiler}`;

    const tooltip = new MarkdownString();
    tooltip.appendMarkdown(`Compiling with **${compiler}**\n\n`);
    tooltip.appendMarkdown(`${compileOptionsSummary(settings)}\n\n`);
    tooltip.appendMarkdown("Click to switch the compiler");
    this.statusBarItem.tooltip = tooltip;
  }

  /** Shows the item in Hollywood workspaces and hides it everywhere else. */
  private async updateVisibility(): Promise<void> {
    if (await hollywoodWorkspace().isHollywoodWorkspace()) {
      this.statusBarItem.show();
    } else {
      this.statusBarItem.hide();
    }
  }

  dispose() {
    this.subscriptions.forEach(subscription => subscription.dispose());
    this.subscriptions.length = 0;
    this.statusBarItem.dispose();
  }
}
