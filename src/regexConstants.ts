/**
 * This is the collection of all used regular expressions
 */

export const multiLineAsOneLineCommentRE = /(?:\/\*.*\*\/)/;

export const variableRE = /(?!.*Function)(?<=(Local|Global)[ \t]*)\b(_|[a-zA-Z])(\w|!|\$)*([ \t]*,[ \t]*((_|[a-zA-Z])(\w|!|\$)*)?)*((?=[ \t]*=))*/i; // don't match, if the line contains the word "Function" anywhere; find "Local t1 = 1" as well as "Local t1, t2 = 1, 2"

export const functionRE = /\b(?:(Local|Global)(?:\s+))?(?:Function)(?:\s+([a-zA-Z_.:]+[.:])?([a-zA-Z_]\w*)\s*)?(\()([^)]*)(\))/i;

export const inlineFunctionRE = /\b(?:(Local|Global)(?:\s+))?(?:([a-zA-Z_.:]+[.:])?([a-zA-Z_]\w*)\s*)?(?:\s*=\s*)(?:Function)(?:\s*)(\()([^)]*)(\))/i;

export const endFunctionRE = /\bEndFunction\b/i;

export const anonymousFunctionRE = /(?:.*\(.*)Function(?:\s*)(\()([^)]*)(\))(?:.*)EndFunction(?:.*\).*)/i;

export const constantsRE = /\b(?:Const(?:\s+))(#\S*)/i;
