import * as vscode from 'vscode';
import { MarkdownString } from 'vscode';

export class HollywoodCompletionItemProvider implements vscode.CompletionItemProvider {

    provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken,
        context: vscode.CompletionContext): Thenable<vscode.CompletionItem[]> | vscode.CompletionItem[] {
        return new Promise<vscode.CompletionItem[]>((resolve, reject) => {

            resolve([
                {
                    label: 'ActivateDisplay',
                    kind: vscode.CompletionItemKind.Function,
                    documentation: new MarkdownString('This command can be used to activate the specified display. Activating a display just means that Hollywood tells the window manager of the host operating system to give the focus to this display. Activating a display does not make the display the current output device for Hollywood\'s graphics library. If you want to select a display, as the current output device, you have to use SelectDisplay() which will also activate the display if you do not explicitly forbid this.\n\n')
                    .appendMarkdown('See SelectDisplay for more information on the difference between active displays and displays that are selected as the current output device.\n\n')
                    .appendMarkdown('Starting with Hollywood 5.0 there is a new optional argument called nofront. If you set this to True, the display will be activated but it will not be moved to the front of the windows\' stacking order. This argument is only handled on AmigaOS compatible systems because active windows in the background are not supported on other operating systems.\n\n')
                    .appendMarkdown('*@param* `id` identifier of the display that shall be activated\n\n')
                    .appendMarkdown('*@param* `nofront` optional: True if display should not be brought to the front (defaults to False which means pop display to front) (V5.0)'),
                    detail: 'display (V4.5) ActivateDisplay(id[, nofront])',
                    insertText: new vscode.SnippetString("ActivateDisplay(${1:id})")
                },
                {
                    label: 'GetApplicationInfo',
                    kind: vscode.CompletionItemKind.Function,
                    documentation: 'This function can be used to obtain the information specified in the @APPXXX preprocessor commands. GetApplicationInfo() returns a table that contains the following fields:',
                    detail: 'system (V6.0)',
                },
                {
                    label: 'GetApplicationList',
                    kind: vscode.CompletionItemKind.Function,
                    documentation: new MarkdownString(`This function returns a table containing a list of all applications that have been registered through application.library.\n\n`).appendMarkdown(`
### Example
`).appendCodeblock(
                        `
t = GetApplicationList()
For Local k = 0 To ListItems(t) - 1 Do DebugPrint(t[k])`, 'hollywood'),
                    detail: 'system (V6.0)'


                },




        ]);
        });
    }

}
