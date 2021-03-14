import * as vscode from 'vscode';

export class HollywoodDefinitionProvider implements vscode.DefinitionProvider {
    public provideDefinition(
        document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken):
        Thenable<vscode.Definition>{
            return new Promise((resolve, reject) => {

                const functionRE = /\b((Local|Global)(?:\s+))?(Function)(?:\s+([a-zA-Z_.:]+[.:])?([a-zA-Z_]\w*)\s*)?(\()([^)]*)(\))/i;

                const range = document.getWordRangeAtPosition(position);
                const selectedWord = document.getText(range);
                let definitions:vscode.Definition = [];

                for (let i = 0; i < document.lineCount; i++) {
                    let eachLine = document.lineAt(i).text.toLowerCase().trim();
                    // if (eachLine.startsWith("local function")) {
                    if (eachLine.includes("local function")) { // TODO: str.search(regexp)
                        if ( eachLine.includes(selectedWord)) { //only selectedWord
                            definitions.push({
                                uri: document.uri,
                                range: document.lineAt(i).range
                            });
                        }
                    }
                }

                resolve(definitions);
            });
    }
}
