import { Disposable, StatusBarAlignment, StatusBarItem, window, workspace } from "vscode";
import { HOLLYWOOD } from "../configuration";

/**
 * Shows the selected compiler in the status bar and acts as the entry point for switching
 * between Hollywood and Miniwood.
 *
 * The item reflects `hollywood.compiler` rather than being told what to display, so it
 * stays correct even when the setting is edited directly in settings.json.
 */
export class StatusBarProvider implements Disposable {

  private statusBarItem: StatusBarItem;
  private configListener: Disposable;

  constructor(switchCommand: string) {
    this.statusBarItem = window.createStatusBarItem(StatusBarAlignment.Right, 100);
    this.statusBarItem.name = "Hollywood Compiler";
    this.statusBarItem.command = switchCommand;
    this.update();
    this.statusBarItem.show();

    this.configListener = workspace.onDidChangeConfiguration(event => {
      if (event.affectsConfiguration("hollywood.compiler")) {
        this.update();
      }
    });
  }

  /** Reads the configured compiler and refreshes label and tooltip. */
  update() {
    const compiler = workspace.getConfiguration("hollywood").get<string>("compiler") ?? HOLLYWOOD;
    this.statusBarItem.text = `$(tools) ${compiler}`;
    this.statusBarItem.tooltip = `Hollywood: running and compiling with ${compiler} — click to switch`;
  }

  dispose() {
    this.configListener.dispose();
    this.statusBarItem.dispose();
  }
}
