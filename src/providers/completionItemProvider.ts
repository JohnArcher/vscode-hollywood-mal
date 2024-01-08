import { CancellationToken, CompletionContext, CompletionItem, CompletionItemProvider, Position, TextDocument } from 'vscode';

import completionItems from '../definitions/commandCompletionItems.json';

export class HollywoodCompletionItemProvider implements CompletionItemProvider {

  provideCompletionItems(_document: TextDocument, _position: Position, _token: CancellationToken, _context: CompletionContext): Thenable<CompletionItem[]> | CompletionItem[] {
    return new Promise<CompletionItem[]>((resolve, _reject) => {
      console.log(completionItems);
      resolve(completionItems);
    });
  }
}
