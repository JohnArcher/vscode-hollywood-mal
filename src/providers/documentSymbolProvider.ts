import * as vscode from 'vscode';

export class HollywoodDocumentSymbolProvider implements vscode.DocumentSymbolProvider {

    private functionsArray;

    public provideDocumentSymbols(
        document: vscode.TextDocument,
        token: vscode.CancellationToken
    ): Thenable<vscode.SymbolInformation[]> {
        return new Promise((resolve, reject) => {

            const symbols: vscode.SymbolInformation[] = [];

            this.functionsArray = []; // muss immer zurückgesetzt werden, da man hier reinkommt, wenn man Dokument wechselt und man sonst die alten Funktionen mit drin hat

            // scan the document for functions
            this.getFunctions(0, document);

            this.functionsArray.forEach((functionDef) => {
                symbols.push({
                    containerName: '',
                    kind: vscode.SymbolKind.Function,
                    name: functionDef.name,
                    location: new vscode.Location(
                        document.uri,
                        new vscode.Range(
                            new vscode.Position(functionDef.startLine, 0), // TODO: character position!?
                            new vscode.Position(functionDef.endLine, 0) // TODO: character position!?
                        )
                    )
                });
            });

            const singeLineComment = /^((?:\s*)(;)(?:\s*))/;
            // const variableRE = /\b(_|[a-zA-Z])(\w|!|\$)*(?=[ \t]*\=)/g; // Test (?<=(Local|Global)[ \t]*)\b(_|[a-zA-Z])(\w|!|\$)*(?=[ \t]*\=)  --> finds all Global ttt = 3 and Local ttt = 3
            const variableRE = /(?<=(Local|Global)[ \t]*)(?!(Function))\b(_|[a-zA-Z])(\w|!|\$)*((?=[ \t]*\=))*/gi; // finds all Global ttt, Global ttt = 3, Local ttt and Local ttt = 3

            for (var i = 0; i < document.lineCount; i++) {
                var line = document.lineAt(i);

                console.log("line for VarDetect", line);
                const commented = singeLineComment.test(line.text);
                if (commented) {
                    continue;
                }
                // FIXME: find simple variable decl without Local and Global (those are automatically Global) -> just remember the declaration, not all usages, so work with an array and check wether we already got it!?

                // let variableName = line.text.match(variableRE); // finds exactely the match, in this case the variable name
                let variableLinePos = line.text.search(variableRE); // finds the position of the first character math of the regex
                // if (variableName) {
                if (variableLinePos >= 0) {

                    let variableNames = [];

                    let lineText = line.text.slice(variableLinePos); // cut the beginning like Local or Global
                    const tempSplit = lineText.split('='); // try to split at '=' if this is variable initialisation
                    if (tempSplit.length) {
                        // this step makes sure that comma separated variable declarations are found, too.
                        variableNames = tempSplit[0].trim().split(/\s*(?:,|$)\s*/); // all variables are at first array index; trim value to get rid of false empty values after the last split which splits at comma and ignores all whitespaces around the commas
                    }

                    console.log("line.range.start", line.range.start)
                    console.log("line.range.end", line.range.end)
                    console.log("line.range.isSingleLine", line.range.isSingleLine)

                    for (let i = 0; i < variableNames.length; i++) {
                        symbols.push({
                            name: variableNames[i],
                            kind: vscode.SymbolKind.Variable,
                            location: new vscode.Location(document.uri, line.range),
                            containerName: ''
                        })
                    }
                }
            }

            resolve(symbols);
        });
    }

    private getFunctions(startLineNumnber: number, document: vscode.TextDocument) {
        const singeLineComment = /^((?:\s*)(;)(?:\s*))/;
        // const functionRE = /(?<=(\bFunction)[ \t]+)(_|[a-zA-Z\d.])*/i;
        const functionRE = /\b((Local|Global)(?:\s+))?(Function)(?:\s+([a-zA-Z_.:]+[.:])?([a-zA-Z_]\w*)\s*)?(\()([^)]*)(\))/i;
        const inlineFunctonRE = /\b((Local|Global)(\s+))?(?:([a-zA-Z_.:]+[.:])?([a-zA-Z_]\w*)\s*)?(?:\s*=\s*)(Function)(?:\s*)(\()([^)]*)(\))/i;
        const endFunctionRE = /\bEndFunction\b/i;

        for (let lineNumber = startLineNumnber; lineNumber < document.lineCount; lineNumber++) {
            let line = document.lineAt(lineNumber);

            console.log("line", line);
            const commented = singeLineComment.test(line.text);
            if (commented) {
                continue;
            }

            // Try to get the function name in one of the two function regexes.
            // If the first regex is undefined at index 5 look if the second is defined there.
            const functionName = functionRE.exec(line.text)?.[5] || inlineFunctonRE.exec(line.text)?.[5];

            // if (posFunc >= 0) {
            // found the regex which means the beginning of the function
            if (functionName) {

                const startLineNumber = lineNumber;
                let endLineNumber = lineNumber;

                // Try to find out whether the whole function is defined on one line
                // example: Local Function test() Local t = 1 DebugPrint(t) EndFunction
                if (new RegExp(endFunctionRE).test(line.text) === false) { // the function end is NOT on the same line, ...

                    // ... so do the recursive call to try to get the next function definition
                    endLineNumber = this.getFunctions(lineNumber + 1, document);

                    // increase the lineNumber counter to the endline, because we now know, that there are no further
                    // functions between the original lineNumber and endLineNumber, so we skip those lines for
                    // the further scanning process
                    lineNumber = endLineNumber;
                }

                this.functionsArray.push(
                    {
                        name: functionName,
                        startLine: startLineNumber,
                        endLine: endLineNumber
                    }
                );

            } else {

                // TODO: umstellen auf .test() wie oben!? Ist vermutlich schneller und performanter
                let endFunctionBlock = line.text.match(endFunctionRE);

                if (endFunctionBlock) {

                    return lineNumber;
                }
            }
        }
    }
}
