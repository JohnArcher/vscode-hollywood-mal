import {
  Disposable, ProcessExecution, Task, TaskDefinition, TaskGroup,
  TaskProvider, TaskScope, tasks, workspace, WorkspaceFolder
} from 'vscode';
import { HollywoodSettings, readHollywoodSettings, warnAboutMissingExePath } from '../configuration';
import { hollywoodWorkspace } from '../hollywoodWorkspace';
import { log } from '../log';

/**
 * Provides ready-made Hollywood tasks so users do not have to write a tasks.json
 * themselves, and so the compiler chosen in the status bar actually reaches the build.
 *
 * The tasks are built from the current configuration. Whenever a setting they depend on
 * changes, the provider is re-registered so Visual Studio Code drops its cached task list
 * (see `registerHollywoodTaskProvider`).
 */

export const HOLLYWOOD_TASK_TYPE = 'hollywood';

/** Settings a generated task depends on. A change to any of them invalidates the list. */
const WATCHED_SETTINGS = [
  'hollywood.compiler',
  'hollywood.exePath',
  'hollywood.miniwoodExePath',
  'hollywood.mainFile',
  'hollywood.mainOutputFile',
  'hollywood.outputExeType'
];

type TaskKind =
  | 'run'
  | 'run-nodebug'
  | 'compile'
  | 'run-current-file'
  | 'compile-current-file';

/** Shape of a `"type": "hollywood"` entry in the user's tasks.json. */
export interface HollywoodTaskDefinition extends TaskDefinition {
  task: TaskKind;
  /** Overrides `hollywood.outputExeType`, e.g. "win64|classic|morphos". */
  exetype?: string;
  /** Appended to the generated arguments, e.g. ["-compress"]. */
  args?: string[];
}

const TASK_TITLES: Record<TaskKind, string> = {
  'run': 'Run main script',
  'run-nodebug': 'Run main script (nodebug)',
  'compile': 'Compile main script',
  'run-current-file': 'Run current file',
  'compile-current-file': 'Compile current file'
};

/**
 * Builds the argument list for one task kind, or undefined if a required setting is
 * missing — an unusable task is better left out of the list than offered and broken.
 */
function buildArguments(kind: TaskKind, settings: HollywoodSettings, definition: HollywoodTaskDefinition): string[] | undefined {
  const exetype = definition.exetype ?? settings.outputExeType;
  const extra = definition.args ?? [];

  switch (kind) {
    case 'run':
      return settings.mainFile ? [settings.mainFile, '-printerror', ...extra] : undefined;

    case 'run-nodebug':
      return settings.mainFile ? [settings.mainFile, '-nodebug', ...extra] : undefined;

    case 'compile':
      return settings.mainFile && settings.mainOutputFile && exetype
        ? [settings.mainFile, '-compile', settings.mainOutputFile, '-exetype', exetype, ...extra]
        : undefined;

    case 'run-current-file':
      return ['${file}', '-printerror', ...extra];

    case 'compile-current-file':
      return exetype
        ? ['${file}', '-compile', '${fileBasenameNoExtension}', '-exetype', exetype, ...extra]
        : undefined;

    default:
      return undefined;
  }
}

export class HollywoodTaskProvider implements TaskProvider {

  private cachedTasks: Promise<Task[]> | undefined;

  provideTasks(): Promise<Task[]> {
    // Kept for the lifetime of this instance. Anything that could change the list —
    // a setting, or the workspace becoming a Hollywood project — replaces the whole
    // provider instead (see `registerHollywoodTaskProvider`), so there is nothing to
    // invalidate here.
    this.cachedTasks ??= this.computeTasks();
    return this.cachedTasks;
  }

  private async computeTasks(): Promise<Task[]> {
    const folders = workspace.workspaceFolders;
    log().info(`Task list requested. Workspace folders: ${folders?.length
      ? folders.map(f => f.uri.fsPath).join(', ')
      : '(none — no folder open)'}`);

    // Checked first, so nothing Hollywood-specific is logged in unrelated projects.
    if (!await hollywoodWorkspace().isHollywoodWorkspace()) {
      log().info('Not a Hollywood workspace — no tasks.');
      return [];
    }

    // Visual Studio Code offers tasks per workspace folder. Without one the tasks are
    // built but never shown, which looks like the provider is broken.
    if (!folders?.length) {
      log().warn('Visual Studio Code does not show tasks while no folder is open. '
        + 'Open your Hollywood project folder (File > Open Folder).');
    }

    const settings = readHollywoodSettings(folders?.[0]);
    log().info(`Compiler: ${settings.compiler}, executable: ${settings.exePath ?? '(not configured)'}, `
      + `mainFile: ${settings.mainFile ?? '(not set)'}, mainOutputFile: ${settings.mainOutputFile ?? '(not set)'}, `
      + `outputExeType: ${settings.outputExeType ?? '(not set)'}`);
    if (!settings.mainFile || !settings.mainOutputFile) {
      log().info('mainFile and/or mainOutputFile are not set, so only the "current file" tasks are offered. '
        + 'Set them as workspace settings to get the main script tasks.');
    }

    const provided = !folders?.length
      ? this.createTasks(TaskScope.Workspace)
      : folders.flatMap(folder => this.createTasks(folder));

    // Without an executable not a single task can be built. Staying silent would be
    // indistinguishable from a broken extension, so say what is missing.
    if (provided.length === 0) {
      log().warn('No tasks could be built.');
      warnAboutMissingExePath({ once: true });
    } else {
      log().info(`Providing ${provided.length} task(s): ${provided.map(t => t.name).join(', ')}`);
    }
    return provided;
  }

  /**
   * Called for `"type": "hollywood"` entries in the user's tasks.json, which carry only a
   * definition and no execution.
   */
  resolveTask(task: Task): Task | undefined {
    const definition = task.definition as HollywoodTaskDefinition;
    if (!definition.task || !(definition.task in TASK_TITLES)) {
      return undefined;
    }
    const folder = typeof task.scope === 'object' ? task.scope : undefined;
    // The name of a resolved task must stay as the user wrote it, otherwise Visual Studio
    // Code cannot match it to the tasks.json entry any more.
    return this.createTask(definition, task.scope ?? TaskScope.Workspace, folder, task.name);
  }

  private createTasks(scope: WorkspaceFolder | TaskScope.Workspace): Task[] {
    const folder = typeof scope === 'object' ? scope : undefined;
    const kinds = Object.keys(TASK_TITLES) as TaskKind[];
    return kinds
      .map(task => this.createTask({ type: HOLLYWOOD_TASK_TYPE, task }, scope, folder))
      .filter((task): task is Task => task !== undefined);
  }

  private createTask(
    definition: HollywoodTaskDefinition,
    scope: WorkspaceFolder | TaskScope,
    folder: WorkspaceFolder | undefined,
    name?: string
  ): Task | undefined {
    const settings = readHollywoodSettings(folder);
    if (!settings.exePath) {
      return undefined;
    }
    const args = buildArguments(definition.task, settings, definition);
    if (!args) {
      return undefined;
    }

    const execution = new ProcessExecution(settings.exePath, args, {
      cwd: folder?.uri.fsPath
    });

    // The name doubles as the identifier: keybindings reference tasks through
    // workbench.action.tasks.runTask, and tasks.json through dependsOn. It must therefore
    // stay stable across a compiler switch — which is what `detail` is for, the second
    // line Visual Studio Code shows in the task picker.
    const task = new Task(
      definition,
      scope,
      name ?? TASK_TITLES[definition.task],
      HOLLYWOOD_TASK_TYPE,
      execution
    );
    task.detail = `${settings.compiler}: ${args.join(' ')}`;

    if (definition.task === 'compile' || definition.task === 'compile-current-file') {
      task.group = TaskGroup.Build;
    }
    return task;
  }
}

/**
 * Registers the provider and keeps it in step with the configuration: the generated tasks
 * embed the compiler path, so switching between Hollywood and Miniwood has to rebuild
 * them. Re-registering is what makes Visual Studio Code discard its cached list.
 */
export function registerHollywoodTaskProvider(): Disposable {
  let provider = new HollywoodTaskProvider();
  let registration = tasks.registerTaskProvider(HOLLYWOOD_TASK_TYPE, provider);
  log().info(`Extension activated, task provider "${HOLLYWOOD_TASK_TYPE}" registered.`);

  /** Re-registering is what makes Visual Studio Code drop its own cached task list. */
  const reregister = (reason: string) => {
    log().info(`${reason} — task provider re-registered.`);
    registration.dispose();
    provider = new HollywoodTaskProvider();
    registration = tasks.registerTaskProvider(HOLLYWOOD_TASK_TYPE, provider);
  };

  const configListener = workspace.onDidChangeConfiguration(event => {
    const changed = WATCHED_SETTINGS.filter(setting => event.affectsConfiguration(setting));
    if (changed.length) {
      reregister(`Settings changed (${changed.join(', ')})`);
    }
  });

  // A workspace turning into a Hollywood project, or ceasing to be one, changes whether
  // the tasks apply at all.
  const contextListener = hollywoodWorkspace().onDidChange(
    () => reregister('Workspace is now a Hollywood project, or no longer one')
  );

  return new Disposable(() => {
    contextListener.dispose();
    configListener.dispose();
    registration.dispose();
  });
}

