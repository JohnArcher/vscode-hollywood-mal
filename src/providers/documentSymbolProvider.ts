import * as vscode from 'vscode';

export class HollywoodDocumentSymbolProvider implements vscode.DocumentSymbolProvider {

    private singeLineComment = /^((?:\s*)(;)(?:\s*))/;
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

            this.functionsArray.forEach((functionDefinition) => {
                symbols.push({
                    containerName: '',
                    kind: vscode.SymbolKind.Function,
                    name: functionDefinition.name,
                    location: new vscode.Location(
                        document.uri,
                        new vscode.Range(
                            new vscode.Position(functionDefinition.startLine, functionDefinition.startLinePosition),
                            new vscode.Position(functionDefinition.endLine, functionDefinition.endLinePosition)
                        )
                    )
                });
            });

            const variableRE = /(?<=(Local|Global)[ \t]*)(?!(Function))\b(_|[a-zA-Z])(\w|!|\$)*((?=[ \t]*\=))*/i; // finds all Global ttt, Global ttt = 3, Local ttt and Local ttt = 3

            for (var lineNumber = 0; lineNumber < document.lineCount; lineNumber++) {
                var line = document.lineAt(lineNumber);

                console.log("line for VarDetect", line);
                const commented = this.singeLineComment.test(line.text);
                if (commented) {
                    continue;
                }

                // FIXME: find simple variable decl without Local and Global (those are automatically Global) -> just remember the declaration, not all usages, so work with an array and check wether we already got it!?

                let variableLinePos = line.text.search(variableRE); // finds the position of the first character math of the regex
                // if (variableName) {
                if (variableLinePos >= 0) {

                    let variableNames: string[] = [];

                    // Try to find comma separated var definitions
                    let lineText = line.text.slice(variableLinePos); // cut the beginning like Local or Global
                    const tempSplit = lineText.split('='); // try to split at '=' if this is variable initialisation
                    if (tempSplit.length) {
                        // this step makes sure that comma separated variable declarations are found, too.
                        variableNames = tempSplit[0].trim().split(/\s*(?:,|$)\s*/); // all variables are at first array index; trim value to get rid of false empty values after the last split which splits at comma and ignores all whitespaces around the commas
                    }

                    for (let name of variableNames) {
                        const startLinePosition = line.text.indexOf(name);

                        symbols.push({
                            containerName: '',
                            name: name,
                            kind: vscode.SymbolKind.Variable,
                            location: new vscode.Location(
                                document.uri,
                                new vscode.Range(
                                    new vscode.Position(lineNumber, startLinePosition),
                                    new vscode.Position(lineNumber, startLinePosition + name.length)
                                )
                            )
                        })
                    }
                }
            }

            resolve(symbols);
        });
    }

    private getFunctions(startLineNumnber: number, document: vscode.TextDocument) {

        const functionRE = /\b((Local|Global)(?:\s+))?(Function)(?:\s+([a-zA-Z_.:]+[.:])?([a-zA-Z_]\w*)\s*)?(\()([^)]*)(\))/i;
        const inlineFunctonRE = /\b((Local|Global)(\s+))?(?:([a-zA-Z_.:]+[.:])?([a-zA-Z_]\w*)\s*)?(?:\s*=\s*)(Function)(?:\s*)(\()([^)]*)(\))/i;
        const endFunctionRE = /\bEndFunction\b/i;

        for (let lineNumber = startLineNumnber; lineNumber < document.lineCount; lineNumber++) {
            let line = document.lineAt(lineNumber);

            console.log("line", line);
            const commented = this.singeLineComment.test(line.text);
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

                // Get the position of the function name to create the proper Range object later for the function definition.
                // FIXME: This only works correctly für "Function as Variable", but the position should also include
                // "Local Function " and not just the following function name
                const startLinePosition = line.text.indexOf(functionName);

                // If the function is defined on one line the end position is the end of the line
                let endLinePosition = line.text.length;

                // Try to find out whether the whole function is defined on one line
                // example: Local Function test() Local t = 1 DebugPrint(t) EndFunction
                if (new RegExp(endFunctionRE).test(line.text) === false) { // the function end is NOT on the same line, ...

                    // ... so do the recursive call to try to get the next function definition
                    endLineNumber = this.getFunctions(lineNumber + 1, document);

                    // increase the lineNumber counter to the endline, because we now know, that there are no further
                    // functions between the original lineNumber and endLineNumber, so we skip those lines for
                    // the further scanning process
                    lineNumber = endLineNumber;

                    // The end position on the line for proper Range creation is the the of the line of the last line of the function (FunctionEnd)
                    endLinePosition = document.lineAt(endLineNumber).text.length;
                }

                this.functionsArray.push(
                    {
                        name: functionName,
                        startLine: startLineNumber,
                        startLinePosition: startLinePosition,
                        endLine: endLineNumber,
                        endLinePosition: endLinePosition
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
