import { CompletionItemKind, MarkdownString } from "vscode";

/**
 * Defines the Interface for Hollywood Completion Items (for Intellisense and Hover Provider)
 */
export interface HollywoodCompletionInterface {
  /**
   * The label of this completion item. By default
   * this is also the text that is inserted when selecting
   * this completion.
   */
  label: string;

  /**
   * The kind of this completion item. Based of the kind an icon is chosen by the editor.
   */
  kind?: CompletionItemKind;

  /**
   * A human-readable string with additional information
   * about this item, like type or symbol information.
   */
  documentation?: string | MarkdownString;

  /**
   * Hollywood version since this item is added
   */
  version?: string;

  args?: string[];

  returns?: string[];

  platforms?: string[];
}
