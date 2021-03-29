import * as vscode from 'vscode';

export class HollywoodDocumentSymbolProvider implements vscode.DocumentSymbolProvider {

    private functionsArray; // TODO: try to make it a local array
    private commentedLines: Array<boolean>;

    public provideDocumentSymbols(
        document: vscode.TextDocument,
        token: vscode.CancellationToken
    ): Thenable<vscode.SymbolInformation[]> {
        return new Promise((resolve, reject) => {

            const symbols: vscode.SymbolInformation[] = [];
            this.functionsArray = []; // muss immer zurückgesetzt werden, da man hier reinkommt, wenn man Dokument wechselt und man sonst die alten Funktionen mit drin hat

            this.commentedLines = []; // resest this array for next processing

            // First pass: Find all commented lines
            this.getCommentedLines(document);

            // Second pass: scan the document for function definitions
            this.getFunctions(0, document);

            this.functionsArray.forEach((functionDefinition) => {
                symbols.push(
                    this.createSymbolInformation(vscode.SymbolKind.Function, functionDefinition.name, document.uri, functionDefinition.startLine, functionDefinition.startLinePosition, functionDefinition.endLine, functionDefinition.endLinePosition)
                );
            });

            // Third pass: scan the document for variable and constant definitions
            // REFACTOR: extract method
            const variableRE = /(?!.*Function)(?<=(Local|Global)[ \t]*)\b(_|[a-zA-Z])(\w|!|\$)*((?=[ \t]*\=))*/i; // finds all Global ttt, Global ttt = 3, Local ttt and Local ttt = 3 but does not match, if the line contains the word Function -> "(?!.*Function)"
            const constantsRE = /\b(?:Const(?:\s+))(#\S*)/i;

            for (var lineNumber = 0; lineNumber < document.lineCount; lineNumber++) {
                var line = document.lineAt(lineNumber);

                if (this.commentedLines[lineNumber]) {
                    continue;
                }

                // FIXME: find simple variable decl without Local and Global (those are automatically Global) -> just remember the declaration, not all usages, so work with an array and check wether we already got it!?

                let variableLinePos = line.text.search(variableRE); // finds the position of the first character match of the regex
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
                        const endLinePosition = startLinePosition + name.length;

                        symbols.push(
                            this.createSymbolInformation(vscode.SymbolKind.Variable, name, document.uri, lineNumber, startLinePosition, lineNumber, endLinePosition)
                        );
                    }
                } else {
                    const constantName = constantsRE.exec(line.text)?.[1];

                    if (constantName) {
                        const startLinePosition = line.text.indexOf(constantName);
                        const endLinePosition = startLinePosition + constantName.length;

                        symbols.push(
                            this.createSymbolInformation(vscode.SymbolKind.Constant, constantName, document.uri, lineNumber, startLinePosition, lineNumber, endLinePosition)
                        );
                    }
                }
            }

            resolve(symbols);
        });
    }

    /**
     * Finds all lines that are commented by single or multiline comments,
     * so no symbols will be collected for those commented lines.
     *
     * @param document the whole document
     */
    private getCommentedLines(document: vscode.TextDocument) {

        const singeLineCommentRE = /^((?:\s*)(;)(?:\s*))/;
        const mulitLineCommentBeginRE = /^(?:\s*)(\/\*)/; // finds at line beginning: "    /*"
        const mulitLineCommentEndRE = /\*\//; // finds the first occurence of: "*/"
        let isInsideMultiLineComment = false; // switch for if we are inside a multiline comment or nor

        for (let lineNumber = 0; lineNumber < document.lineCount; lineNumber++) {
            let line = document.lineAt(lineNumber);
            let commented = false;

            // if we are inside a multiline comment ...
            if (isInsideMultiLineComment) {
                commented = true; // ... the whole line is always commented

                // test, if we hit the end of the multiline comment
                if (mulitLineCommentEndRE.test(line.text)) {
                    isInsideMultiLineComment = false; // leave "multiline mode" for the next line
                }
            } else {

                // A multiline comment starts on the current line
                if (mulitLineCommentBeginRE.test(line.text)) {
                    commented = true;

                    // just if the comment is NOT closed on the same line, we are truely multilined
                    if (!mulitLineCommentEndRE.test(line.text)) {
                        isInsideMultiLineComment = true;
                    }
                } else {
                    // if it is not a multiline comment test if we have a single line comment
                    commented = singeLineCommentRE.test(line.text);
                }
            }

            this.commentedLines.push(commented);
        }
    }

    private getFunctions(startLineNumnber: number, document: vscode.TextDocument) {

        const functionRE = /\b((Local|Global)(?:\s+))?(Function)(?:\s+([a-zA-Z_.:]+[.:])?([a-zA-Z_]\w*)\s*)?(\()([^)]*)(\))/i;
        const inlineFunctonRE = /\b((Local|Global)(\s+))?(?:([a-zA-Z_.:]+[.:])?([a-zA-Z_]\w*)\s*)?(?:\s*=\s*)(Function)(?:\s*)(\()([^)]*)(\))/i;
        /**
         * Anonymous functions have to be ignored here, otherwise they break the structure!
         * These are functions that are passed to another function as a anonymous parameter
         * Example: Sort(array, Function(a, b) Return(a < b) EndFunction)
         */
        const anonymousFunction = /(?:.*\(.*)Function(?:\s*)(\()([^)]*)(\))(?:.*)EndFunction(?:.*\).*)/i;
        const endFunctionRE = /\bEndFunction\b/i;

        for (let lineNumber = startLineNumnber; lineNumber < document.lineCount; lineNumber++) {
            let line = document.lineAt(lineNumber);

            if (this.commentedLines[lineNumber]) {
                continue;
            }

            // Try to get the function name in one of the two function regexes.
            // If the first regex is undefined at index 5 look if the second is defined there.
            const functionName = functionRE.exec(line.text)?.[5] || inlineFunctonRE.exec(line.text)?.[5];

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
                if (endFunctionRE.test(line.text) === false) { // the function end is NOT on the same line, ...

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

            } else { // if it is not the beginning of a function, test whether it is the end of the function definition or if it is an anonymous function
                if (!anonymousFunction.exec(line.text) && endFunctionRE.test(line.text)) {
                    return lineNumber;
                }
            }
        }
    }

    /**
     * Creates the structure for the SymbolInformation.
     *
     * @param kind
     * @param name
     * @param documentUri
     * @param startLine
     * @param startLinePosition
     * @param endLine
     * @param endLinePosition
     * @returns
     */
    private createSymbolInformation(kind: vscode.SymbolKind, name: string, documentUri: vscode.Uri, startLine: number, startLinePosition: number, endLine: number, endLinePosition: number): vscode.SymbolInformation {
        return {
            containerName: '',
            kind: kind,
            name: name,
            location: new vscode.Location(
                documentUri,
                new vscode.Range(
                    new vscode.Position(startLine, startLinePosition),
                    new vscode.Position(endLine, endLinePosition)
                )
            )
        };
    }
}
