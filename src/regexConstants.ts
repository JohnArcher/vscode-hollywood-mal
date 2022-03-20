/**
 * This is the collection of all used regular expressions
 */

export const multiLineAsOneLineCommentRE = /(?:\/\*.*\*\/)/;

export const variableRE = /(?!.*Function)(?<=(Local|Global)[ \t]*)\b(_|[a-zA-Z])(\w|!|\$)*([ \t]*,[ \t]*((_|[a-zA-Z])(\w|!|\$)*)?)*((?=[ \t]*\=))*/i; // don't match, if the line contains the word "Function" anywhere; find "Local t1 = 1" as well as "Local t1, t2 = 1, 2"
