import { CancellationToken, CompletionContext, CompletionItem, CompletionItemKind, CompletionItemLabel, CompletionItemProvider, MarkdownString, Position, SnippetString, TextDocument } from 'vscode';

import { HollywoodCompletionItemModel } from '../models/hollywoodCompletionItem.model';
import HollywoodLibrariesEnum from '../enums/hollywoodLibraries.enum';
import HollywoodCommandTypesEnum from '../enums/hollywoodCommandTypes.enum';

import { getCommentedLines, cleanMultiLineComment } from '../utils';
import * as RE from '../regexConstants';

// import completionItems from '../definitions/commandCompletionItems.json';
import preprocDefinitions from '../definitions/preprocDefinitions.json';
import consoleLibraryDefinitions from '../definitions/consoleLibraryDefinitions.json';
import drawLibraryDefinitions from '../definitions/drawLibraryDefinitions.json';
import stringLibraryDefinitions from '../definitions/stringLibraryDefinitions.json';
import tableLibraryDefinitions from '../definitions/tableLibraryDefinitions.json';
import miscDefinitions from '../definitions/miscDefinitons.json';

export class HollywoodCompletionItemProvider implements CompletionItemProvider {

  private commandCompletionItems: CompletionItem[] = [];

  provideCompletionItems(document: TextDocument, _position: Position, _token: CancellationToken, _context: CompletionContext): Thenable<CompletionItem[]> | CompletionItem[] {
    return new Promise<CompletionItem[]>((resolve, _reject) => {
      // Find user specific symbols like functions, variables and constants
      // This must not be cached, because the user can change the document
      const symbols = this.getUserspeficSymbols(document);

      if (this.commandCompletionItems.length === 0) {
        const hollywoodComands: HollywoodCompletionItemModel[] = [
          ...consoleLibraryDefinitions.map((item: HollywoodCompletionItemModel) => { item.category = HollywoodLibrariesEnum.Console; return item; }),
          ...drawLibraryDefinitions.map((item: HollywoodCompletionItemModel) => { item.category = HollywoodLibrariesEnum.Draw; return item; }),
          ...stringLibraryDefinitions.map((item: HollywoodCompletionItemModel) => { item.category = HollywoodLibrariesEnum.String; return item; }),
          ...tableLibraryDefinitions.map((item: HollywoodCompletionItemModel) => { item.category = HollywoodLibrariesEnum.Table; return item; }),
        ];

        const commands = this.generateCompletionItems(hollywoodComands, CompletionItemKind.Function);

        const hollywoodPreprocs: HollywoodCompletionItemModel[] = [
          ...preprocDefinitions.map((item: HollywoodCompletionItemModel) => {
            // Try to map the category string to the enum
            const category = HollywoodLibrariesEnum[item.category as keyof typeof HollywoodLibrariesEnum];

            if (category) {
              item.category = category;
            } else {
              item.category = HollywoodLibrariesEnum.Unknown;
            }

            return item;
          })
        ];

        // _Maybe_ Event, Enum, TypeParameter for Kind
        const preprocs = this.generateCompletionItems(hollywoodPreprocs, CompletionItemKind.Issue, HollywoodCommandTypesEnum.Preproc);

        const misc: HollywoodCompletionItemModel[] = [
          ...miscDefinitions.map((item: HollywoodCompletionItemModel) => { item.category = HollywoodLibrariesEnum.Unknown; return item; }),
        ];

        const miscItems = this.generateCompletionItems(misc, CompletionItemKind.Keyword, HollywoodCommandTypesEnum.Misc);


        this.commandCompletionItems = [
          ...commands, ...preprocs, ...miscItems
        ];
      }

      // TODO:
      // - Problem-Doku:
      //   - https://www.hollywood-mal.com/docs/html/hollywood/atDISPLAY.html
      //   - https://www.hollywood-mal.com/docs/html/hollywood/GetObjects_.html

      const items = [...this.commandCompletionItems];

      // Only add the user symbols as otherwise adding an empty array would disable our complex intellisense and would fallback to normal word intellisense
      // Has to be added here in this way and not to this.commandCompletionItems as this would cache the list and you would get symbols from other files, too, which we don't want
      if (symbols.length) {
        items.push(...symbols);
      }

      resolve(items);

    });
  }

  private getUserspeficSymbols(document: TextDocument): CompletionItem[] {
    // TODO: get only symbols belonging to their local context
    // First pass: Find all commented lines
    const commentedLines = getCommentedLines(document);

    // The Map is used to avoid duplicate entries
    const symbols = new Map<string, CompletionItem>();

    for (let lineNumber = 0; lineNumber < document.lineCount; lineNumber++) {
      const line = document.lineAt(lineNumber).text;

      // ignore commented lines
      if (commentedLines[lineNumber]) {
        continue;
      }

      // Delete multiline comments that are written on one line, so additional variable defintion after the comment are found, too
      // Example: Local t9 /* t10 */, t15
      const lineText = cleanMultiLineComment(line);

      const functionName = RE.functionRE.exec(lineText)?.[3] || RE.inlineFunctionRE.exec(lineText)?.[3];

      if (functionName) {
        // TODO: try to get the parameters as well to create a better intellisense
        symbols.set(functionName, new CompletionItem(functionName, CompletionItemKind.Function));
      } else {
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

          for (const varName of variableNames) {
            if (varName) {
              const symbolKind = (variableREResult[1].toLocaleLowerCase() === 'global') ? CompletionItemKind.Field : CompletionItemKind.Variable;

              symbols.set(varName, new CompletionItem(varName, symbolKind));
            }
          }
        } else {
          const constantName = RE.constantsRE.exec(line)?.[1];

          if (constantName) {
            symbols.set(constantName, new CompletionItem(constantName, CompletionItemKind.Constant));
          }
        }
      }
    }

    return Array.from(symbols.values());
  }

  /**
   * Generates the Completion Items for the given Hollywood Completion Item Models.
   *
   * @param completionModels The Hollywood Completion Item Models.
   * @returns The Completion Items.
   */
  private generateCompletionItems(completionModels: HollywoodCompletionItemModel[], completionItemKind: CompletionItemKind, commandType?: HollywoodCommandTypesEnum): CompletionItem[] {
    const items = (completionModels).map((item: HollywoodCompletionItemModel) => {
      // This is the part that is shown directly next to the function name, mostly used for showing the parameters
      let itemDetail: string;

      // TODO: same for preprocs?
      if (completionItemKind === CompletionItemKind.Function) {
        itemDetail = item.synopsis;
        const match = item.synopsis.match(/^(.*?)\(/); // get everything before the first opening bracket
        if (match) {
          itemDetail = item.synopsis.replace(match[1], ""); // remove the part before the first opening bracket to get the parameters only
        }
      }

      const itemLabel: CompletionItemLabel = {
        label: item.name,
        description: item.shortDescription,
        detail: itemDetail
      };

      const completionItem: CompletionItem = new CompletionItem(itemLabel, completionItemKind);

      completionItem.detail = item.synopsis;

      if (item.functionDocs) {
        completionItem.documentation = this.generateDocumentation(item, commandType);
      }

      completionItem.insertText = item.insertText ? new SnippetString(item.insertText) : item.name;

      // TODO: only for @INCLUDE
      completionItem.command = {
        command: 'extension.selectFilePath',
        title: 'Trigger Parameter Hints'
      };


      return completionItem;
    });

    return items;
  }

  /**
 * Generates the documentation for a Hollywood Command.
 *
 * @param item The Hollywood Command Completion Item.
 * @returns The documentation as MarkdownString.
 */
  private generateDocumentation(item: HollywoodCompletionItemModel, commandType: HollywoodCommandTypesEnum = HollywoodCommandTypesEnum.Function): MarkdownString {
    const hollywoodDocsBaseUrl = 'https://www.hollywood-mal.com/docs/html/hollywood/'; // TODO: later: get it from the settings
    let itemName = item.name;
    if (commandType === HollywoodCommandTypesEnum.Function) {
      itemName += '()';
    }

    let libraryLabel = `${item.category} library`;
    if (item.version) {
      libraryLabel += ` (V${item.version})`;
    }

    // TODO: ggf. mit MarkdownString.appendMarkdown() etc. arbeiten, um die einzelnen Teile zu erstellen und dann zusammenzufügen (siehe HoverProvider)

    let fullDocumentation = `${libraryLabel}  — See online help for [${itemName}](${hollywoodDocsBaseUrl}${item.helpId}.html)`;
    fullDocumentation +=`\n\n${item.functionDocs}`;
    fullDocumentation += `\n\n---\n\n**Inputs/Parameters**  \n${item.inputsDocs}`;
    fullDocumentation += `\n\n---\n\n**Results/Returns**  \n${item.resultsDocs}`;

    if (item.example) {
      fullDocumentation += `\n\n---\n\n**Example**  \n${item.example}`;
    }

    if (item.platforms) {
      fullDocumentation += `\n\n---\n\n**Platforms**  \n${item.platforms.join(', ')}`;
    }

    return new MarkdownString(fullDocumentation);
  }
}
