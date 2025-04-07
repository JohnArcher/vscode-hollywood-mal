import { commands, ExtensionContext, languages, window, workspace } from 'vscode'; // The module 'vscode' contains the VS Code extensibility API
import { HollywoodDocumentSymbolProvider } from './providers/documentSymbolProvider';
import { HollywoodDefinitionProvider } from './providers/definitionProvider';
import { HollywoodCompletionItemProvider } from './providers/completionItemProvider';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: ExtensionContext) {
  context.subscriptions.push(languages.registerDocumentSymbolProvider(
    { language: "hollywood" }, new HollywoodDocumentSymbolProvider()
  ));

  context.subscriptions.push(languages.registerDefinitionProvider(
    { language: "hollywood" }, new HollywoodDefinitionProvider()
  ));


  // Intellisense/Code Completion with Quick Info for showing accompanying documentation
  context.subscriptions.push(languages.registerCompletionItemProvider(
    { language: "hollywood" }, new HollywoodCompletionItemProvider()
  ));
  // TEST for entering a file path
  const disposable = commands.registerCommand('extension.selectFilePath', () => {
    const activeEditor = window.activeTextEditor;

    if (activeEditor) {
      const line = activeEditor.document.lineAt(activeEditor.selection.start.line);
      if (line.text.match("@INCLUDE")) {
        const charBeforeCursor = line.text.charAt(activeEditor.selection.start.character - 1);
        const charAfterCursor = line.text.charAt(activeEditor.selection.start.character);

        // Check if the cursor is between two quotes
        if (charBeforeCursor === '"' && charAfterCursor === '"') {
          // Get all files in the workspace
          workspace.findFiles('**/*.{hws,hwa}').then(files => {
            // Convert the Uri objects to strings representing the file paths
            const filePaths = files.map(file => workspace.asRelativePath(file.fsPath));

            // Show a quick pick menu with the file paths
            window.showQuickPick(filePaths).then(selectedFilePath => {
              if (selectedFilePath) {
                // Insert the selected file path at the current cursor position
                const activeEditor = window.activeTextEditor;
                if (activeEditor) {
                  activeEditor.edit(editBuilder => {
                    editBuilder.insert(activeEditor.selection.start, selectedFilePath);
                  });
                }
              }
            });
          });
        }
      }
    }
  });

  context.subscriptions.push(disposable);

}
