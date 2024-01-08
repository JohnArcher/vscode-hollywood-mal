import { Definition, DefinitionProvider, TextDocument, Position, Range, workspace } from 'vscode';

import * as RE from '../regexConstants';

import { getCommentedLines, cleanMultiLineComment, escapeRegExp } from '../utils';

export class HollywoodDefinitionProvider implements DefinitionProvider {

  public provideDefinition(
    document: TextDocument, position: Position): Thenable<Definition>{
    return new Promise((resolve) => {

      const range = document.getWordRangeAtPosition(position);
      const selectedWord = document.getText(range);

      // if a workspace has been opened ...
      if (workspace.name) {

        // TODO: workspace config to use all files or just opened ones
        const workspaceFiles = workspace.findFiles('**/*.hws');

        workspaceFiles.then(
          (uriList) => {

            // List of all promises for finding and getting the definition in all opened documents
            const definitionPromises: Thenable<Definition>[] = [];

            for (const uri of uriList) {
              const document = workspace.openTextDocument(uri);

              definitionPromises.push(document.then(
                doc => {
                  const localDefinitions = this.getDefinitions(doc, selectedWord);

                  return localDefinitions;
                }));
            }

            // wait until all Promises were resolved, so we have the definition results of all files in the workspace
            Promise.all(definitionPromises).then(
              value => resolve(value.flat()) // flat merges array values
            );
          },
          (reason) => console.log('rejected because of ', reason)
        );

        // TODO: this is the faster alternative which just scans open files
        // let definitions: Definition = [];

        // const documents = workspace.textDocuments;

        // for (let document of documents) {
        //     const localDefinitions = this.getDefinitions(document, selectedWord);

        //     definitions = definitions.concat(localDefinitions);
        // }

        // resolve(definitions);

      } else { // if no workspace is opened, fallback to the current document
        resolve(this.getDefinitions(document, selectedWord));
      }
    });
  }

  private getDefinitions(document: TextDocument, selectedWord: string): Definition {
    const functionRE = /\b(?:(Local|Global)(?:\s+))?(?:Function)(?:\s+([a-zA-Z_.:]+[.:])?([a-zA-Z_]\w*)\s*)?(\()([^)]*)(\))/i;
    const inlineFunctionRE = /\b(?:(Local|Global)(?:\s+))?(?:([a-zA-Z_.:]+[.:])?([a-zA-Z_]\w*)\s*)?(?:\s*=\s*)(?:Function)(?:\s*)(\()([^)]*)(\))/i;

    const constantsRE = /\b(?:Const(?:\s+))(#\S*)/i;

    // First pass: Find all commented lines
    const commentedLines = getCommentedLines(document);

    const definitions: Definition = [];

    for (let lineNumber = 0; lineNumber < document.lineCount; lineNumber++) {
      const line = document.lineAt(lineNumber).text;

      // ignore commented lines
      if (commentedLines[lineNumber]) {
        continue;
      }

      // Delete multiline comments that are written on one line, so additional variable defintion after the comment are found, too
      // Example: Local t9 /* t10 */, t15
      const lineText = cleanMultiLineComment(line);

      let name = functionRE.exec(lineText)?.[3] || inlineFunctionRE.exec(lineText)?.[3] || constantsRE.exec(lineText)?.[1];

      if (!name) { // special treatment for variables as they could be initialized comma separated like "Local t1, t2 = 1, 2"
        let tempVariableNames = RE.variableRE.exec(lineText)?.[0];

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
        const functionResult = new RegExp(escapeRegExp(selectedWord)).exec(line);

        if (functionResult) {
          definitions.push({
            uri: document.uri,
            range: new Range(
              new Position(lineNumber, functionResult.index), // index is the position of the first character of the matching string (= selectedWord)
              new Position(lineNumber, functionResult.index + selectedWord.length)
            )
          });
        }
      }
    }

    return definitions;
  }

}
