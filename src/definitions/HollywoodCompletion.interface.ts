import { CompletionItemKind, MarkdownString } from "vscode";

/**
 * Defines the Interface for Hollywood Completion Items (for Intellisense and Hover Provider)
 */
export interface HollywoodCompletionInterface {
    /**
     * Label of the Item.
     */
    label: string;

    /**
     * The kind of this completion item. Based on the kind
     * an icon is chosen by the editor.
     */
    kind?: CompletionItemKind;

    /**
     * Optional property that provides additional information about the completion item.
     * This can be a simple string or a MarkdownString for more complex documentation that includes markdown syntax.
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
