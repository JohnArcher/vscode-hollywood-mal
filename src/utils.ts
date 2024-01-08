import { TextDocument } from 'vscode';

import * as RE from './regexConstants';

/**
 * Finds all lines that are commented by single or multiline comments,
 * so no symbols, definitions etc. will be collected for those commented lines.
 *
 * @param document the whole document
 */
export function getCommentedLines(document: TextDocument): Array<boolean> {
  const commentedLines: Array<boolean> = [];

  const singeLineCommentRE = /^((?:\s*)(;)(?:\s*))/;
  const mulitLineCommentBeginRE = /^(?:\s*)(\/\*)/; // finds at line beginning: "    /*"
  const mulitLineCommentEndRE = /\*\//; // finds the first occurence of: "*/"
  let isInsideMultiLineComment = false; // switch for if we are inside a multiline comment or nor

  for (let lineNumber = 0; lineNumber < document.lineCount; lineNumber++) {
    const line = document.lineAt(lineNumber);
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

/**
 * Cleans lines from multiline comments that are written on one line, so additional variable defintions after the comment can be found
 *
 * @example: Local t9 /* t10 *\/, t15
 * @param line The line to clean.
 * @returns
 */
export function cleanMultiLineComment(line: string): string {
  return line.replace(RE.multiLineAsOneLineCommentRE, '');
}

/**
 * Escapes special regex characters in a string, so that this string can be used in a regex.
 * @see https://stackoverflow.com/a/6969486/887930
 *
 * @param theString String which may contain characters to be escaped
 * @returns the escaped string
 */
export function escapeRegExp(theString: string): string {
  return theString.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}
