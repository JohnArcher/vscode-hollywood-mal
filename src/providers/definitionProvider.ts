import * as vscode from 'vscode';

// TODO: find all function, variable and constant definitions (see documentSymbolProvider)
// TODO: use workspace and fallback to open files if no workspace is defined
// TODO: exclude commented lines (see documentSymbolProvider)

export class HollywoodDefinitionProvider implements vscode.DefinitionProvider {
    public provideDefinition(
        document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken):
        Thenable<vscode.Definition>{
            return new Promise((resolve, reject) => {

                // TODO: is /i correct? I guess it is not correct if names are case sensitive in Hollywood (like in lua)
                const functionRE = /\b(?:(Local|Global)(?:\s+))?(?:Function)(?:\s+([a-zA-Z_.:]+[.:])?([a-zA-Z_]\w*)\s*)?(\()([^)]*)(\))/i;
                const inlineFunctionRE = /\b(?:(Local|Global)(?:\s+))?(?:([a-zA-Z_.:]+[.:])?([a-zA-Z_]\w*)\s*)?(?:\s*=\s*)(?:Function)(?:\s*)(\()([^)]*)(\))/i;
                const variableRE = /(?!.*Function)(?<=(Local|Global)[ \t]*)\b(_|[a-zA-Z])(\w|!|\$)*((?=[ \t]*\=))*/i; // don't match, if the line contains the word "Function" anywhere
                const constantsRE = /\b(?:Const(?:\s+))(#\S*)/i; // TODO: Vereinfachung; eventuell auch im DocumentSymbolProvider so nutzbar!
                // TODO: variable definition like Local tt1, tt2, tt3

                const range = document.getWordRangeAtPosition(position);
                const selectedWord = document.getText(range);

                let definitions: vscode.Definition = [];

                for (let lineNumber = 0; lineNumber < document.lineCount; lineNumber++) {
                    let line = document.lineAt(lineNumber).text;

                    const name = functionRE.exec(line)?.[3] || inlineFunctionRE.exec(line)?.[3] || variableRE.exec(line)?.[0] || constantsRE.exec(line)?.[1];

                    // if the evaluated name is equal to the selected word we have found the definition line
                    if (name === selectedWord) {

                        /** Create a dynamic regex to find the selected word and its position on the line.
                          * It has to be a regex to find the _exact_ match, otherwise if selectedWord is "myFunc"
                          * then also "myFunc2" etc. would be found if you would use string.include() or string.indexOf().
                          * It is also important to escape special characters like $ because this is a valid character
                          * in a Hollywood variable but also a regex special character.
                          */
                        const functionResult = new RegExp(this.escapeRegExp(selectedWord)).exec(line);

                        if (functionResult) {
                            definitions.push({
                                uri: document.uri,
                                range: new vscode.Range(
                                    new vscode.Position(lineNumber, functionResult.index), // index is the position of the first character of the matching string (= selectedWord)
                                    new vscode.Position(lineNumber, functionResult.index + selectedWord.length) // document.lineAt(lineNumber).range.end.character
                                )
                            });
                        }
                    }
                }

                resolve(definitions);
            });
    }

    /**
     * Escapes special regex characters in a string, so that this string can be used in a regex.
     * @see https://stackoverflow.com/a/6969486/887930
     *
     * @param string String which may contain characters to be escaped
     * @returns the escaped string
     */
    private escapeRegExp(string) {
      return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
    }
}
