/**
 * Defines the model for Hollywood Completion Items (for Intellisense and Hover Provider)
 */
export interface HollywoodCompletionItemModel {
  /**
   * Name of the command
   */
  name: string; // entspricht in Hollywood-Doku ersten Teil von "Name". Siehe GetApplicationInfo

  helpId?: string; // Teil der Url, die auf die entsprechende Hilfeseite verweist. Wird vermutlich meistens wie "name" sein. TODO: Andreas fragen.

  category?: string; // TODO: vielleicht doch nicht damit arbeiten, sondern spezifisch im provider für jede Bibliothek eigenen Completion Items erstellen und dann als Array zurückgeben. Siehe auch https://github.com/microsoft/vscode-extension-samples/blob/main/completions-sample/src/extension.ts Hat Vorteil, falls ich das mit Draw. oder Draw: machen will.

  shortDescription: string; // entspricht in Hollywood-Doku zweiten Teil von "Name". Siehe GetApplicationInfo

  /**
   * Hollywood version since this item is added
   */
  version?: string; // entspricht in Hollywood-Doku dritten Teil von "Name". Siehe GetApplicationInfo

  synopsis: string; // entspricht in Hollywood-Doku "Synopsis". Siehe GetApplicationInfo

  functionDocs?: string; // entspricht in Hollywood-Doku "Function". Siehe GetApplicationInfo

  inputsDocs?: string; // entspricht in Hollywood-Doku "Inputs". Siehe Arc

  resultsDocs?: string; // entspricht in Hollywood-Doku "Results". Siehe GetApplicationInfo

  example?: string; // siehe in Hollywood-Doku: DrawConsoleBorder

  /**
   * Platforms that this command is supported on.
   */
  platforms?: string[]; // siehe in Hollywood-Doku: DrawConsoleBorder

  insertText?: string; // TODO nur ein Test. das kann ich Andreas nicht zumuten. Oder doch? Ist wie Synopsys, aber ohne optionale Parameter!? Michi fragen.
}
