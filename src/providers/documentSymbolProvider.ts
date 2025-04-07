import { DocumentSymbolProvider, Location, Position, Range, SymbolKind, SymbolInformation, TextDocument, Uri } from 'vscode';

import * as RE from '../regexConstants';

import { getCommentedLines, cleanMultiLineComment } from "../utils";

export class HollywoodDocumentSymbolProvider implements DocumentSymbolProvider {

  private functionsArray; // TODO: try to make it a local array
  private commentedLines: Array<boolean>;

  public provideDocumentSymbols(
    document: TextDocument
  ): Thenable<SymbolInformation[]> {
    return new Promise((resolve) => {

      this.functionsArray = []; // muss immer zurückgesetzt werden, da man hier reinkommt, wenn man Dokument wechselt und man sonst die alten Funktionen mit drin hat

      this.commentedLines = []; // resest this array for next processing

      // First pass: Find all commented lines
      this.commentedLines = getCommentedLines(document);

      // Second pass: scan the document for function definitions
      this.getFunctions(0, document);

      const symbols = this.getSymbols(document);

      resolve(symbols);
    });
  }

  private getSymbols(document: TextDocument): SymbolInformation[] {
    const symbols: SymbolInformation[] = [];

    this.functionsArray.forEach((functionDefinition) => {
      symbols.push(
        this.createSymbolInformation(SymbolKind.Function, functionDefinition.name, document.uri, functionDefinition.startLine, functionDefinition.startLinePosition, functionDefinition.endLine, functionDefinition.endLinePosition)
      );
    });

    // Third pass: scan the document for variable and constant definitions
    // REFACTOR: extract method

    for (let lineNumber = 0; lineNumber < document.lineCount; lineNumber++) {
      const line = document.lineAt(lineNumber).text;

      // ignore commented lines
      if (this.commentedLines[lineNumber]) {
        continue;
      }

      // Delete multiline comments that are written on one line, so additional variable defintion after the comment are found, too
      // Example: Local t9 /* t10 */, t15
      const lineText = cleanMultiLineComment(line);

      // FIXME: find simple variable decl without Local and Global (those are automatically Global) -> just remember the declaration, not all usages, so work with an array and check wether we already got it!?
      const variableREResult = RE.variableRE.exec(lineText);

      if (variableREResult) {
        let tempVariableNames = variableREResult[0];

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

        for (const name of variableNames) {
          if (name) {
            const startLinePosition = line.indexOf(name);
            const endLinePosition = startLinePosition + name.length;

            const symbolKind = (variableREResult[1].toLocaleLowerCase() === 'global') ? SymbolKind.Field : SymbolKind.Variable;

            symbols.push(
              this.createSymbolInformation(symbolKind, name, document.uri, lineNumber, startLinePosition, lineNumber, endLinePosition)
            );
          }
        }
      } else {
        const constantName = RE.constantsRE.exec(line)?.[1];

        if (constantName) {
          const startLinePosition = line.indexOf(constantName);
          const endLinePosition = startLinePosition + constantName.length;

          symbols.push(
            this.createSymbolInformation(SymbolKind.Constant, constantName, document.uri, lineNumber, startLinePosition, lineNumber, endLinePosition)
          );
        }
      }
    }

    return symbols;
  }

  private getFunctions(startLineNumnber: number, document: TextDocument) {
    for (let lineNumber = startLineNumnber; lineNumber < document.lineCount; lineNumber++) {
      const line = document.lineAt(lineNumber);

      if (this.commentedLines[lineNumber]) {
        continue;
      }

      // Try to get the function name in one of the two function regexes.
      // If the first regex is undefined at index 3 look if the second is defined there.
      const functionName = RE.functionRE.exec(line.text)?.[3] || RE.inlineFunctionRE.exec(line.text)?.[3];

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
        if (RE.endFunctionRE.test(line.text) === false) { // the function end is NOT on the same line, ...

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
        /**
         * Anonymous functions have to be ignored here, otherwise they break the structure!
         * These are functions that are passed to another function as a anonymous parameter
         * Example: Sort(array, Function(a, b) Return(a < b) EndFunction)
         */
        if (!RE.anonymousFunctionRE.exec(line.text) && RE.endFunctionRE.test(line.text)) {
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
  private createSymbolInformation(kind: SymbolKind, name: string, documentUri: Uri, startLine: number, startLinePosition: number, endLine: number, endLinePosition: number): SymbolInformation {
    return {
      containerName: '',
      kind: kind,
      name: name,
      location: new Location(
        documentUri,
        new Range(
          new Position(startLine, startLinePosition),
          new Position(endLine, endLinePosition)
        )
      )
    };
  }
}
