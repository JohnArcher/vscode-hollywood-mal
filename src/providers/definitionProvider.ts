import * as vscode from 'vscode';

import { getCommentedLines, cleanMultiLineComment } from "../utils";

// TODO: use workspace and fallback to open files if no workspace is defined

export class HollywoodDefinitionProvider implements vscode.DefinitionProvider {
    private commentedLines: Array<boolean>;

    public provideDefinition(
        document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken):
        Thenable<vscode.Definition>{
            return new Promise((resolve, reject) => {
                this.commentedLines = []; // resest this array for next processing

                // First pass: Find all commented lines
                this.commentedLines = getCommentedLines(document);

                const functionRE = /\b(?:(Local|Global)(?:\s+))?(?:Function)(?:\s+([a-zA-Z_.:]+[.:])?([a-zA-Z_]\w*)\s*)?(\()([^)]*)(\))/i;
                const inlineFunctionRE = /\b(?:(Local|Global)(?:\s+))?(?:([a-zA-Z_.:]+[.:])?([a-zA-Z_]\w*)\s*)?(?:\s*=\s*)(?:Function)(?:\s*)(\()([^)]*)(\))/i;
                const variableRE = /(?!.*Function)(?<=(Local|Global)[ \t]*)\b(_|[a-zA-Z])(\w|!|\$)*([ \t]*,[ \t]*((_|[a-zA-Z])(\w|!|\$)*)?)*((?=[ \t]*\=))*/i; // don't match, if the line contains the word "Function" anywhere; find "Local t1 = 1" as well as "Local t1, t2 = 1, 2"
                const constantsRE = /\b(?:Const(?:\s+))(#\S*)/i;

                const range = document.getWordRangeAtPosition(position);
                const selectedWord = document.getText(range);

                let definitions: vscode.Definition = [];

                for (let lineNumber = 0; lineNumber < document.lineCount; lineNumber++) {
                    let line = document.lineAt(lineNumber).text;

                    // ignore commented lines
                    if (this.commentedLines[lineNumber]) {
                        continue;
                    }

                    // Delete multiline comments that are written on one line, so additional variable defintion after the comment are found, too
                    // Example: Local t9 /* t10 */, t15
                    let lineText = cleanMultiLineComment(line);

                    let name = functionRE.exec(lineText)?.[3] || inlineFunctionRE.exec(lineText)?.[3] || constantsRE.exec(lineText)?.[1];

                    if (!name) { // special treatment for variables has they could be initialized comma separated like "Local t1, t2 = 1, 2"
                        let tempVariableNames = variableRE.exec(lineText)?.[0];

                        if (!tempVariableNames) {
                            continue; // break out here as we don't have a varibale (or any other) definition
                        }

                        let variableNames: string[] = [];

                        // Delete everything that is commented out at the end of the line
                        // otherwise the structure gets broken.
                        // Example: Local t9 ;, t10
                        const pos = tempVariableNames.search(/;/);
                        if (pos > -1) {
                            tempVariableNames = tempVariableNames.substring(0, pos);
                        }

                        // this step makes sure that comma separated variable declarations are found, too.
                        variableNames = tempVariableNames.trim().split(/\s*(?:,|$)\s*/); // trim value to get rid of false empty values after the last split which splits at comma and ignores all whitespaces around the commas

                        if (variableNames.indexOf(selectedWord) > -1) {
                            name = selectedWord;
                        }
                    }

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
                                    new vscode.Position(lineNumber, functionResult.index + selectedWord.length)
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
