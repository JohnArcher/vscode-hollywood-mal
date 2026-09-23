import { extname } from 'path';
import {
  CompletionItem, CompletionItemKind, CompletionItemProvider, FileType, Position, Range,
  TextDocument, Uri, workspace
} from 'vscode';

/**
 * Completes file names inside the quoted argument of a preprocessor directive.
 *
 * Paths in Hollywood are resolved relative to the script that names them, so the list is
 * built by reading the directory the user has typed so far, starting at the document's own
 * folder — the same way the built-in HTML and CSS path completion works. Picking a folder
 * reopens the list, which turns the completion into browsing.
 */

/** Opens the list when the string begins, and again after each path separator. */
export const PATH_TRIGGER_CHARACTERS = ['"', '/', '\\'];

/** What `@INCLUDE` can pull in: another script, or an assembled source file. */
const SOURCE_EXTENSIONS = ['.hws', '.hwa'];

type PathKind =
  /** Only Hollywood sources are worth offering. */
  | 'source'
  /** Any file: which formats load is a question of the platform or installed plugins, not of the name. */
  | 'file'
  /** Folders only. */
  | 'directory';

/**
 * The directives whose quoted argument names a path.
 *
 * Everything left out names something that is not a file — `@REQUIRE` a plugin, `@FONT` a
 * typeface, `@APPTITLE` free text — and gets no list at all rather than a misleading one.
 */
const PATH_DIRECTIVES = new Map<string, PathKind>([
  ['@INCLUDE', 'source'],
  ['@APPENTRY', 'source'],
  ['@ANIM', 'file'],
  ['@APPICON', 'file'],
  ['@BGPIC', 'file'],
  ['@BRUSH', 'file'],
  ['@CATALOG', 'file'],
  ['@FILE', 'file'],
  ['@ICON', 'file'],
  ['@MUSIC', 'file'],
  ['@PALETTE', 'file'],
  ['@SAMPLE', 'file'],
  ['@SPRITE', 'file'],
  ['@VIDEO', 'file'],
  ['@DIRECTORY', 'directory']
]);

/** A directive has to open the line; a `;` in front of it makes the line a comment. */
const DIRECTIVE_PATTERN = /^\s*(@[A-Za-z]+)\b/;

interface PathContext {
  kind: PathKind;
  /** Everything between the opening quote and the cursor. */
  typed: string;
}

/**
 * Describes the path being typed at `position`, or nothing if that is not a path at all.
 *
 * Also asked by the command completion, which steps aside here: three thousand function
 * names mixed into a directory listing would bury it.
 */
export function pathContextAt(document: TextDocument, position: Position): PathContext | undefined {
  const before = document.lineAt(position.line).text.slice(0, position.character);

  const directive = DIRECTIVE_PATTERN.exec(before)?.[1].toUpperCase();
  const kind = directive && PATH_DIRECTIVES.get(directive);
  if (!kind) {
    return undefined;
  }

  // An odd number of quotes puts the cursor inside the string; an even one after it.
  const quotesBefore = before.split('"').length - 1;
  if (quotesBefore % 2 === 0) {
    return undefined;
  }

  return { kind, typed: before.slice(before.lastIndexOf('"') + 1) };
}

/** Reopens the list after a folder, so a path can be walked without pressing Ctrl+Space. */
const CONTINUE_PATH = { command: 'editor.action.triggerSuggest', title: 'Continue the path' };

function keep(name: string, isDirectory: boolean, kind: PathKind): boolean {
  if (name.startsWith('.')) {
    return false;
  }
  if (isDirectory) {
    // Folders stay even when looking for files: they are the way to the file.
    return true;
  }
  if (kind === 'directory') {
    return false;
  }
  return kind !== 'source' || SOURCE_EXTENSIONS.includes(extname(name).toLowerCase());
}

export class HollywoodPathCompletionItemProvider implements CompletionItemProvider {

  async provideCompletionItems(document: TextDocument, position: Position): Promise<CompletionItem[]> {
    const context = pathContextAt(document, position);
    // An unsaved document has no folder to resolve a relative path against.
    if (!context || document.isUntitled) {
      return [];
    }

    // Hollywood accepts either separator on Windows, so both split the typed path. What
    // precedes the last one selects the directory to list, what follows filters it.
    const separator = Math.max(context.typed.lastIndexOf('/'), context.typed.lastIndexOf('\\'));
    const typedDirectory = context.typed.slice(0, separator + 1).replace(/\\/g, '/');
    const filter = context.typed.slice(separator + 1);

    const documentDirectory = Uri.joinPath(document.uri, '..');
    const directory = typedDirectory
      ? Uri.joinPath(documentDirectory, typedDirectory)
      : documentDirectory;

    let entries: [string, FileType][];
    try {
      entries = await workspace.fs.readDirectory(directory);
    } catch {
      // A half-typed folder name; there is simply nothing to list yet.
      return [];
    }

    // Replacing just the filter keeps the already typed part of the path intact.
    const range = new Range(position.translate(0, -filter.length), position);

    // A script pulling in itself is an endless loop, so it is left out of its own list.
    // Compared without case, because Windows and macOS treat the two spellings as one file.
    const self = context.kind === 'source' ? document.uri.path.toLowerCase() : undefined;

    const items = entries.flatMap(([name, type]) => {
      const isDirectory = (type & FileType.Directory) !== 0;
      if (!keep(name, isDirectory, context.kind)) {
        return [];
      }
      if (self && !isDirectory && Uri.joinPath(directory, name).path.toLowerCase() === self) {
        return [];
      }
      return [createItem(isDirectory ? `${name}/` : name, isDirectory, range)];
    });

    // Appended after the listing, but sorted to the top of the folders by its name.
    items.push(createItem('../', true, range));
    return items;
  }
}

function createItem(label: string, isDirectory: boolean, range: Range): CompletionItem {
  const item = new CompletionItem(
    label,
    isDirectory ? CompletionItemKind.Folder : CompletionItemKind.File
  );
  item.range = range;
  // Folders before files, each alphabetically — the order of a file browser. Without this
  // the list would be sorted by how well the label matches, which scatters the folders.
  item.sortText = `${isDirectory ? '0' : '1'}${label.toLowerCase()}`;
  if (isDirectory) {
    item.command = CONTINUE_PATH;
  }
  return item;
}
