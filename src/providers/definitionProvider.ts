import * as vscode from 'vscode';

// TODO: find all function, variable and constant definitions (see documentSymbolProvider)
// TODO: use workspace and fallback to open files if no workspace is defined
// TODO: exclude commented lines (see documentSymbolProvider)

export class HollywoodDefinitionProvider implements vscode.DefinitionProvider {
    public provideDefinition(
        document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken):
        Thenable<vscode.Definition>{
            return new Promise((resolve, reject) => {

                const functionRE = /\b((Local|Global)(?:\s+))?(Function)/i;

                const range = document.getWordRangeAtPosition(position);
                const selectedWord = document.getText(range);

                let definitions: vscode.Definition = [];

                for (let lineNumber = 0; lineNumber < document.lineCount; lineNumber++) {
                    let line = document.lineAt(lineNumber).text;

                    if (line.search(functionRE) > -1) { // test if it is a normal function

                        /** Create a dynamic regex to find the selected word and its position on the line.
                          * It has to be a regex to find the _exact_ match, otherwise if selectedWord is "myFunc"
                          * also "myFunc2" etc. would be found if you would use string.include() or string.indexOf()
                          */
                        const functionResult = new RegExp('\\b(' + selectedWord + ')\\b').exec(line);

                        if (functionResult) {
                            definitions.push({
                                uri: document.uri,
                                range: new vscode.Range(
                                    new vscode.Position(lineNumber, functionResult.index), // index is the position of the first character of the matching string (= selectedWord)
                                    new vscode.Position(lineNumber, document.lineAt(lineNumber).range.end.character)
                                )
                            });
                        }
                    }
                }

                resolve(definitions);
            });
    }
}
