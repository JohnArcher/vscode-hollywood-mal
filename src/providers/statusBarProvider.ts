import { Disposable, StatusBarAlignment, StatusBarItem, window, workspace } from "vscode";
import { HOLLYWOOD } from "../configuration";
import { hollywoodWorkspace } from "../hollywoodWorkspace";

/**
 * Shows the selected compiler in the status bar and acts as the entry point for switching
 * between Hollywood and Miniwood.
 *
 * The item reflects `hollywood.compiler` rather than being told what to display, so it
 * stays correct even when the setting is edited directly in settings.json. It only appears
 * in Hollywood workspaces: the extension can be activated in any project merely by
 * someone opening the task list, and a Hollywood item has no business in a foreign one.
 */
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
        if (event.affectsConfiguration("hollywood.compiler")) {
          this.update();
        }
      }),
      hollywoodWorkspace().onDidChange(() => this.updateVisibility())
    );

    this.updateVisibility();
  }

  /** Reads the configured compiler and refreshes label and tooltip. */
  update() {
    const compiler = workspace.getConfiguration("hollywood").get<string>("compiler") ?? HOLLYWOOD;
    this.statusBarItem.text = `$(tools) ${compiler}`;
    this.statusBarItem.tooltip = `Hollywood: running and compiling with ${compiler} — click to switch`;
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
