import { Disposable, ExtensionContext, languages } from 'vscode'; // The module 'vscode' contains the VS Code extensibility API
import { HollywoodDocumentSymbolProvider } from './providers/documentSymbolProvider';
import { HollywoodDefinitionProvider } from './providers/definitionProvider';
import { HollywoodCompletionItemProvider } from './providers/completionItemProvider';
import { StatusBarProvider } from './providers/statusBarProvider';
import { registerHollywoodTaskProvider } from './providers/taskProvider';
import { registerCurrentFileCommands } from './commands/currentFileCommands';
import { registerSelectFilePathCommand } from './commands/selectFilePathCommand';
import { registerSwitchCompilerCommand, SWITCH_COMPILER_COMMAND } from './commands/switchCompilerCommand';
import { disposeLog } from './log';

const HOLLYWOOD_SELECTOR = { language: "hollywood" };

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: ExtensionContext) {
  context.subscriptions.push(
    // Language features
    languages.registerDocumentSymbolProvider(HOLLYWOOD_SELECTOR, new HollywoodDocumentSymbolProvider()),
    languages.registerDefinitionProvider(HOLLYWOOD_SELECTOR, new HollywoodDefinitionProvider()),
    // Intellisense/Code Completion with Quick Info for showing accompanying documentation
    languages.registerCompletionItemProvider(HOLLYWOOD_SELECTOR, new HollywoodCompletionItemProvider()),

    // Compiler selection: the status bar shows it, tasks and commands act on it.
    new StatusBarProvider(SWITCH_COMPILER_COMMAND),
    registerSwitchCompilerCommand(),
    registerHollywoodTaskProvider(),

    // Run and compile the open script without needing a folder or a task.
    registerCurrentFileCommands(),

    registerSelectFilePathCommand(),

    // Last, so anything disposed before it can still log.
    new Disposable(disposeLog)
  );
}
