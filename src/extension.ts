// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { ExtensionContext, languages} from 'vscode';
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


  // Intellisense
  context.subscriptions.push(languages.registerCompletionItemProvider(
    {language: "hollywood"}, new HollywoodCompletionItemProvider()
  ));
}
