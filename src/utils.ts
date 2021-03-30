import * as vscode from 'vscode';

/**
 * Finds all lines that are commented by single or multiline comments,
 * so no symbols, definitions etc. will be collected for those commented lines.
 *
 * @param document the whole document
 */
export function getCommentedLines(document: vscode.TextDocument): Array<boolean> {
    console.log('getCommentedLines')
    const commentedLines: Array<boolean> = [];

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

        commentedLines.push(commented);
    }

    return commentedLines;
}
