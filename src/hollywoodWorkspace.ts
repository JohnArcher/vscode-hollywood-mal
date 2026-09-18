import { Disposable, Event, EventEmitter, workspace } from 'vscode';
import { log } from './log';

/**
 * Answers whether this window is about Hollywood at all, and tells its listeners when
 * that answer changes.
 *
 * Since VS Code 1.76 contributing task definitions activates the extension whenever the
 * task list is opened — in any project. Being active therefore says nothing about the
 * project, so everything user-visible (the status bar item, the provided tasks) asks here
 * first instead of showing up in unrelated workspaces.
 *
 * Detection follows what the built-in task providers do: npm looks for a package.json,
 * gulp for a gulpfile, and this looks for Hollywood sources.
 */

/** Language id contributed in package.json. */
export const HOLLYWOOD_LANGUAGE_ID = 'hollywood';

/** Marks a workspace as a Hollywood project, the way a package.json marks an npm one. */
export const HOLLYWOOD_FILE_GLOB = '**/*.hws';

class HollywoodWorkspace implements Disposable {

  private answer: Promise<boolean> | undefined;
  private lastKnown: boolean | undefined;
  private readonly changed = new EventEmitter<void>();
  private readonly subscriptions: Disposable[] = [];

  /** Fires only when the answer actually flips, not on every file event. */
  readonly onDidChange: Event<void> = this.changed.event;

  constructor() {
    // Only creation and deletion matter; edits cannot turn a project into a Hollywood one.
    const watcher = workspace.createFileSystemWatcher(HOLLYWOOD_FILE_GLOB, false, true, false);
    this.subscriptions.push(
      watcher,
      watcher.onDidCreate(() => this.refresh()),
      watcher.onDidDelete(() => this.refresh()),
      workspace.onDidChangeWorkspaceFolders(() => this.refresh()),
      // Covers the folder-less case: a single Hollywood file opened on its own.
      workspace.onDidOpenTextDocument(document => {
        if (document.languageId === HOLLYWOOD_LANGUAGE_ID) {
          this.refresh();
        }
      })
    );
  }

  /** Cached, because the task list is fetched often and scanning is not free. */
  isHollywoodWorkspace(): Promise<boolean> {
    this.answer ??= this.detect();
    return this.answer;
  }

  private async refresh(): Promise<void> {
    // Read the previous answer before re-detecting — detect() updates `lastKnown` itself,
    // so comparing afterwards would compare the new value with itself.
    const previous = this.lastKnown;
    this.answer = undefined;
    if (await this.isHollywoodWorkspace() !== previous) {
      this.changed.fire();
    }
  }

  private async detect(): Promise<boolean> {
    // A Hollywood file open without any folder — nothing to scan, but clearly Hollywood.
    if (workspace.textDocuments.some(document => document.languageId === HOLLYWOOD_LANGUAGE_ID)) {
      log().info('Hollywood file open in the editor.');
      this.lastKnown = true;
      return true;
    }

    const folders = workspace.workspaceFolders;
    if (!folders?.length) {
      log().info('No folder open and no Hollywood file in the editor.');
      this.lastKnown = false;
      return false;
    }

    const found = await workspace.findFiles(HOLLYWOOD_FILE_GLOB, '**/node_modules/**', 1);
    const isHollywood = found.length > 0;
    log().info(isHollywood
      ? `Hollywood project detected (${found[0].fsPath}).`
      : `No ${HOLLYWOOD_FILE_GLOB} found in ${folders.map(folder => folder.name).join(', ')} — not a Hollywood project.`);
    this.lastKnown = isHollywood;
    return isHollywood;
  }

  dispose(): void {
    this.subscriptions.forEach(subscription => subscription.dispose());
    this.subscriptions.length = 0;
    this.changed.dispose();
  }
}

let instance: HollywoodWorkspace | undefined;

export function hollywoodWorkspace(): HollywoodWorkspace {
  instance ??= new HollywoodWorkspace();
  return instance;
}

export function disposeHollywoodWorkspace(): void {
  instance?.dispose();
  instance = undefined;
}
