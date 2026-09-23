# Hollywood for Visual Studio Code (hw4vsc)

**DISCLAIMER:** This is not an official product by Airsoft Softwair.

This extension adds support for [Hollywood](https://www.hollywood-mal.com) **version 11: Coderise** to Visual Studio Code (Windows, macOS, Linux). Hollywood is a multimedia-oriented programming language designed to create applications and games and is available for AmigaOS, Windows, macOS, and Linux. Hollywood (and therefore this extension) is capable of compiling to the following target plattforms:

* AmigaOS
* Android
* AROS
* iOS
* Linux
* macOS
* MophOS
* WarpOS
* Windows

![Example of this extension (Dark Theme)](https://raw.githubusercontent.com/JohnArcher/vscode-hollywood-mal/master/media/dark_theme.png)

In order to make use of the extension you need to buy a copy of Hollywood here: <https://www.hollywood-mal.com/purchase.html>

More information about Hollywood is available here: <https://www.hollywood-mal.com>

You can find the Hollywood documentation here: <https://www.hollywood-mal.com/docs/html/hollywood/>

*NOTICE*: The major version number of this plugin correspondes with the major version number of Hollywood. Therefore the first release version of this extension was 8.0.1.

## Table of Contents <!-- omit in toc -->

* [Hollywood for Visual Studio Code (hw4vsc)](#hollywood-for-visual-studio-code-hw4vsc)
  * [Features](#features)
  * [Installation](#installation)
  * [Configuration](#configuration)
    * [Path to Hollywood executeable](#path-to-hollywood-executeable)
    * [Choose the compiler: Hollywood or Miniwood](#choose-the-compiler-hollywood-or-miniwood)
    * [Define main file](#define-main-file)
    * [Define main output file](#define-main-output-file)
    * [Define standard executable output format](#define-standard-executable-output-format)
      * [Compile options](#compile-options)
  * [Run and compile](#run-and-compile)
    * [Provided Tasks](#provided-tasks)
    * [Customise Tasks](#customise-tasks)
    * [Run a Task](#run-a-task)
    * [Commands for the current script](#commands-for-the-current-script)
    * [Run a script with F5](#run-a-script-with-f5)
  * [Dark and Light Theme](#dark-and-light-theme)
  * [Intellisense](#intellisense)
    * [Path completion](#path-completion)
  * [Go to definition](#go-to-definition)
  * [Document Symbols/Go to Symbol](#document-symbolsgo-to-symbol)
  * [Code Snippets](#code-snippets)
  * [Thank you](#thank-you)
  * [Support](#support)
  * [TODOs / Future](#todos--future)
  * [Disclaimer on the use of AI](#disclaimer-on-the-use-of-ai)

## Features

First of all you can use the great inbuilt editing features of Visual Studio Code like quick file navigation including fuzzy search (press `Ctrl + P`), Multi-Cursor, easy code editing (like line cloning, deletion, and swapping), project/workspace support, bracket matching and so forth. Please consult the [Visual Studio Code documentation](https://code.visualstudio.com/docs) for more infos.

Additionally this extension supports:

* Hollywood specific syntax highlighting including a [Light and Dark Theme](#dark-and-light-theme)
* [Intellisense with code completion](#intellisense) of all inbuilt Hollywood functions/commands
* Hollywood specific [Code Snippets](#code-snippets)
* [Go to definition](#go-to-definition) functionallity for variables, constants, and functions
* [Document Symbols](#document-symbolsgo-to-symbol) for showing your variables, constants, and functions in the Outline and Breadcrump view and for easy code navigation
* [Ready-made tasks](#provided-tasks) for running and compiling, no `tasks.json` required
* [Commands for the current script](#commands-for-the-current-script), which also work without an open folder
* [Switching between Hollywood and Miniwood](#choose-the-compiler-hollywood-or-miniwood) from the status bar
* Code indention
* Code folding

## Installation

There are several ways to install this extension:

1. Install and open [Visual Studio Code](https://code.visualstudio.com).
2. Press `Ctrl+Shift+X` or `Cmd+Shift+X` to open the Extensions pane or click on the corresponding button in the side bar.
3. Find the Hollywood extension (look for "Hollywood MAL") and click `Install`.

Alternatively you can use this direct link: <https://marketplace.visualstudio.com/items?itemName=michaeljurisch.hollywood-mal>

or

1. Download the latest release in the form of a `.vsix` file in this extensions [GitHub releases tab](https://github.com/JohnArcher/vscode-hollywood-mal/releases)
2. Open a command prompt (like cmd or PowerShell on Windows), navigate to the downloaded extension and enter `code --install-extension hollywood-mal-11.0.0.vsix`, where `hollywood-mal-11.0.0.vsix` has to be the name of the downloaded file.

or

Download/check out the content of the GitHub repo and copy it to your extension folder:

* **Windows:** `%USERPROFILE%\.vscode\extensions`
* **macOS:** `~/.vscode/extensions`
* **Linux:** `~/.vscode/extensions`

Now create or open a `.hws` file. The extension is activated now.

## Configuration

Open User or Workspace Settings by pressing `Ctrl+Shift+P` and enter `settings` or open the extension pane, click the *manage* icon on the Hollywood extension and select *Extension Settings*.

There are two types of settings supported by this extensions: *User Settings* and *Workspace Settings*. While the first ones are **globally** set for all Visual Studio Code instances the latter ones are set just **in a workspace** which you can imagine as a project.

In order to create a workspace for your code, create a folder for your project, open it in Visual Studio Code, select `File` -> `Save Workspace As...` in the menu and set a name for your workspace file.

For a detailed description, please consult the docs  [User and Workspace settings](https://code.visualstudio.com/docs/getstarted/settings)

### Path to Hollywood executeable

Setting: `hollywood.exePath`

In order to run and compile your Hollywood scripts you have to define the location of the Hollywood main program  on your computer. Although you could use the standard `Hollywood.exe` it makes more sense to use `Hollywood_Console.exe` which resists in the same folder. In the context of this extension the advantage of the Console version is that output like debug statements (`DebugPrint()`) or error messages (with console argument `-printerror`, see [the tasks.json example file](https://github.com/JohnArcher/vscode-hollywood-mal/blob/master/exampleFiles/tasks.json)) are send to the **Terminal panel** of Visual Studio Code - which increases the integrated experience - and not opened in a separate window or modal dialog.

Normally this should be a **User** Setting (and not a Workspace Setting), so the executeable is defined globally for all your Hollywood projects.

![Configuration of hollywood.exePath in Settings](https://raw.githubusercontent.com/JohnArcher/vscode-hollywood-mal/master/media/configuration_exepath.png)

Example *settings.json*: `"hollywood.exePath": "C:\\Program Files\\Hollywood\\Hollywood_Console.exe"`

*NOTICE*: Up to version 10 this documentation asked you to wrap paths containing spaces in extra double quotes. That is no longer necessary — the [provided tasks](#provided-tasks) start the compiler directly, without a shell. Extra quotes left over from an older setup are removed automatically.

### Choose the compiler: Hollywood or Miniwood

Settings: `hollywood.compiler`, `hollywood.miniwoodExePath`

Hollywood 11 introduced **Miniwood**, a compiler that links only the libraries your script actually declares with `@USING`, where Hollywood always links all of them and therefore produces executables of typically at least 2 MB. That size is no problem on modern systems, but it is where memory is limited or a program has to fit on a single 880 KB disk — on 68k AmigaOS, for instance.

Miniwood is not a reduced Hollywood: everything works, you just declare what you use. Which also means that if executable size does not matter to you, there is no reason to bother — Hollywood is the more convenient of the two. This extension can run and compile with either one.

Set `hollywood.miniwoodExePath` to your Miniwood executable, the same way as for Hollywood above: normally a **User** setting, and again the Console version so output ends up in the **Terminal panel**.

Example *settings.json*: `"hollywood.miniwoodExePath": "C:\\Program Files\\Hollywood\\Miniwood_Console.exe"`

To switch, click the compiler name in the **status bar** (bottom right) and pick the one you want, or press `Ctrl+Shift+P` and run `Hollywood: Switch Hollywood/Miniwood`. The selection is stored in `hollywood.compiler` as a **Workspace** setting, so different projects can use different compilers.

The status bar entry appears in Hollywood workspaces only — the same rule the [provided tasks](#provided-tasks) follow — so it stays out of your other projects.

All [provided tasks](#provided-tasks) follow this selection, so switching immediately changes what a build actually runs — there is no need to edit your tasks.

### Define main file

Setting: `hollywood.mainFile`

Whether your Hollywood project consists of one or more files, you should define the main Hollywood file of your project. This will help you compiling and running your project via [Tasks](#configure-tasks).

This is a setting that should be defined as a Workspace Setting (so create a Workspace first if you haven't done yet (`File` -> `Save Workspace as ...`)).

![Configuration of hollywood.mainFile in Settings](https://raw.githubusercontent.com/JohnArcher/vscode-hollywood-mal/master/media/configuration_mainfile.png)

Example in *YOUR_PROJECT.code-workspace*: `"hollywood.mainFile": "mainApp.hws"`

### Define main output file

Setting: `hollywood.mainOutputFile`

This settings lets you define the name of the compiled program which is the output of the compiling process. It comes in handy when using [Tasks](#configure-tasks). The setting should not contain a file extension like `.exe` as this is added by the [executable output format](#define-standard-executable-output-format).

This is a setting that should be defined as a Workspace Setting (so create a Workspace first if you haven't done yet (`File` -> `Save Workspace as ...`)).

![Configuration of hollywood.mainOutputFile in Settings](https://raw.githubusercontent.com/JohnArcher/vscode-hollywood-mal/master/media/configuration_main-output-file.png)

Example in *YOUR_PROJECT.code-workspace*: `"hollywood.mainOutputFile": "mainApp"`

### Define standard executable output format

Setting: `hollywood.outputExeType`

This setting specifies the output format of the executable that the Hollywood compiler shall create.

The best approach is to define this in the **user** settings (so it is defined globally for all your projects) and override it in **workspace** settings if needed, so you can have different output formats for different workspaces/projects.

![Configuration of hollywood.outputExeType in Settings](https://raw.githubusercontent.com/JohnArcher/vscode-hollywood-mal/master/media/configuration_outputexetype.png)

Example in *YOUR_PROJECT.code-workspace*: `"hollywood.outputExeType": "classic"`

In order to define multiple targets, e.g. `win64|classic|morphos`, you have to create a separate Task (see description below or have a look for [the example file](https://github.com/JohnArcher/vscode-hollywood-mal/blob/master/exampleFiles/tasks.json).

For a complete list of all output formats check the `-exetype` console argument under <https://www.hollywood-mal.com/docs/html/hollywood/ManualUsage.html>

#### Compile options

Settings: `hollywood.compress`, `hollywood.consoleMode`

Two switches change how an executable is built. They are the same two the *Create executable* dialog of the official Hollywood IDE offers next to the target list, and both only affect compiling, never running a script.

**`hollywood.compress`** compresses the generated applet or executable. This pays off most together with [Miniwood](#choose-the-compiler-hollywood-or-miniwood), because the linked libraries are compressed as well — the two combined are the way to get executables as small as possible.

**`hollywood.consoleMode`** builds a console program on Windows and macOS. Up to Hollywood 10 this was a target of its own, `win32console` or `win64console`. **Hollywood 11 removed both**: pick `win32` or `win64` above and switch this on instead.

Each adds its console argument — `-compress` and `-consolemode` — to every compile task and to `Hollywood: Compile current file`. Inside a script the equivalents are the `Compress` and `ConsoleMode` tags in `@OPTIONS`, which the [Intellisense](#intellisense) documents.

Because both apply to every build while living in the settings, their current state is named where it matters: in the title of [`Hollywood: Compile to…`](#commands-for-the-current-script) and in the tooltip of the compiler entry in the status bar, each spelling out *compression: on · console mode: off*.

The second line of a task in the task list, and the first line in the terminal, show the actual command instead — there an enabled switch appears as `-compress` or `-consolemode`, and a disabled one simply is not there.

## Run and compile

You run and compile Hollywood scripts through Visual Studio Code Tasks. For a deeper dive it is recommended to read the [official Visual Studio Code documentation for Tasks](https://code.visualstudio.com/docs/editor/tasks).

### Provided Tasks

**Since version 11.0.0 you no longer have to write a `tasks.json`.** The extension provides these tasks itself, built from your [configuration](#configuration):

| Task | What it does |
| --- | --- |
| `Run main script` | Runs `hollywood.mainFile` with `-printerror` |
| `Run main script (nodebug)` | Runs `hollywood.mainFile` with `-nodebug` |
| `Compile main script` | Compiles `hollywood.mainFile` to `hollywood.mainOutputFile` using `hollywood.outputExeType` |
| `Run current file` | Runs the file currently open in the editor with `-printerror` |
| `Compile current file` | Compiles the file currently open in the editor |

The task picker shows the compiler and the exact arguments below each entry, for example *Miniwood: main.hws -compile MyGame -exetype win64*, and [switching the compiler](#choose-the-compiler-hollywood-or-miniwood) updates the tasks right away. The names themselves stay the same, so keybindings and `dependsOn` references keep working across a switch.

The tasks show up as soon as the workspace contains at least one `.hws` file, so they are there right after opening a project and stay out of the way in unrelated ones.

A task only appears when the settings it needs are filled in — if no compile task shows up, `hollywood.mainOutputFile` is most likely still empty. If none show up at all, `hollywood.exePath` (or `hollywood.miniwoodExePath`) is not configured yet; the extension says so and offers to open the setting.

Paths containing spaces need no quoting in provided tasks, because they are not passed through a shell.

### Customise Tasks

Create a `tasks.json` in your `.vscode` folder when you want to mark a default build task, override a setting for a single task, or add further console arguments. Use `"type": "hollywood"` and name the task with `"task"`:

```json
{
    "type": "hollywood",
    "task": "compile",
    "label": "Compile main script to multiple targets",
    "exetype": "win64|classic|morphos",
    "args": ["-compress"],
    "group": {
        "kind": "build",
        "isDefault": true
    }
}
```

* `"task"`: which of the provided tasks to base this on — `run`, `run-nodebug`, `compile`, `run-current-file` or `compile-current-file`
* `"exetype"`: *optional*, overrides `hollywood.outputExeType`, which is how you compile to [multiple targets](#define-standard-executable-output-format) at once
* `"args"`: *optional*, further [Hollywood console arguments](https://www.hollywood-mal.com/docs/html/hollywood/ManualUsage.html) appended to the generated ones

Hollywood knows well over a hundred console arguments, most of them controlling the display at runtime. These are the ones worth knowing when compiling:

| Argument | What it does |
| --- | --- |
| `-compress` | Compresses the generated applet or executable. Usually set through [`hollywood.compress`](#compile-options) rather than by hand |
| `-consolemode` | Builds a console program on Windows and macOS. Usually set through [`hollywood.consoleMode`](#compile-options) rather than by hand |
| `-linkplugins list` | Links the named plugins into the executable instead of requiring them at runtime |
| `-forcemonolithic` | Links data files into the executable instead of the app bundle, for macOS arm64 |
| `-overwrite` | Overwrites existing files without asking |
* `"group"`: *optional*, marks the task as the default so `Ctrl+Shift+B` runs it

More examples are in [the example file](https://github.com/JohnArcher/vscode-hollywood-mal/blob/master/exampleFiles/tasks.json).

Plain `"type": "shell"` tasks still work exactly as before, using `${config:hollywood.exePath}` together with `${config:hollywood.mainFile}`, `${config:hollywood.mainOutputFile}` and `${config:hollywood.outputExeType}`. Such tasks always call Hollywood and ignore the compiler selection.

*NOTICE*: By default the current working directory is the current workspace root. For shell tasks you can change it with the `"cwd"` option (see [this link for details](https://code.visualstudio.com/docs/editor/tasks)).

### Run a Task

If you have set **default task** simple press `Ctrl+Shift+B` to run that specific task.

For all other tasks you have to follow these steps:

1. Press `Ctrl+Shift+P` to show the Command Palette
2. Enter `Run Task`
3. Pick the task you want to run — the [provided tasks](#provided-tasks) are grouped under **hollywood**
4. Select `Continue without scanning the task output` or `Never scan the task output for this task` if you want to ignore this message in the future

![Task picker](https://raw.githubusercontent.com/JohnArcher/vscode-hollywood-mal/master/media/run_task.png)

### Commands for the current script

Three commands work without going through the task list:

* `Hollywood: Run current file`
* `Hollywood: Compile current file`
* `Hollywood: Compile to…`

The first two use the [selected compiler](#choose-the-compiler-hollywood-or-miniwood) just like the tasks do, save the file first if it has unsaved changes, and open a terminal in the folder of the script. Compiling writes the executable next to the script, named after it.

The terminal **stays open after the compiler finishes**, ending with a line such as `[Hollywood_Console.exe finished with exit code 1]`, so error messages remain readable. Close it yourself when you are done; the next run reuses it.

Every invocation passes `-errorcode 1`, because Hollywood otherwise returns 0 even after reporting an error — a build would always look successful.

Unlike tasks, these commands also work when **no folder is open** — Visual Studio Code cannot show tasks in single-file mode ([microsoft/vscode#40515](https://github.com/Microsoft/vscode/issues/40515)), so for a quick script this is the more reliable route.

**`Hollywood: Compile to…`** asks which platforms to build for and compiles for all of them at once, without touching `hollywood.outputExeType`:

```
Compile main.hws with Hollywood
  ✓ win64      Windows executable (x64)
  ✓ classic    AmigaOS 3.x executable (68020+)
    morphos    MorphOS executable (PowerPC)
    …
```

The targets currently configured in `hollywood.outputExeType` come pre-ticked, so confirming straight away builds exactly what a normal compile task would. It compiles the [main file](#define-main-file) if one is configured, otherwise the script in the editor, and it honours the [compile options](#compile-options) like everything else.

This is the counterpart of the *Create executable* dialog in the official Hollywood IDE: its base name is `hollywood.mainOutputFile`, its two switches are the compile options, and its list of platforms is this quick pick.

### Run a script with F5

If you have already worked with the official Hollywood IDE you may be used to press F5 to run the current script. You can adopt the same behaviour with this extension through overriding the keybinding. In this example we will run the project's [main script](#define-main-file) by starting the corresponding [provided task](#provided-tasks).

In order to override the setting you have to follow these steps:

1. Press `Ctrl+Shift+P` to show the Command Palette
2. Enter `Open Keyboard Shortcuts (JSON)`
3. The file `keybindings.json` which may be nearly empty is opened. Please copy the following code **between** `[` and `]` and save the file:

```json
{
   "key": "f5",
   "command": "workbench.action.tasks.runTask",
   "args": "Run main script",
   "when": "resourceLangId == hollywood"
}
```

It is important to set the `"args"` parameter exactely like the name of the task you want to start — either one of the [provided tasks](#provided-tasks) or the `"label"` of a task you configured in your `tasks.json`. Of course it is possible to start another task and/or use other keys (see the `"key"` parameter).

The names of the provided tasks do not change when you switch between Hollywood and Miniwood, so a keybinding set up this way keeps working with either compiler.

If you would rather run **the script you are currently editing** — closer to what F5 does in the official Hollywood IDE — bind the [command](#commands-for-the-current-script) instead. It needs no task name at all and also works when no folder is open:

```json
{
   "key": "f5",
   "command": "hollywood.runCurrentFile",
   "when": "resourceLangId == hollywood"
}
```

`"when": "resourceLangId == hollywood"` ensures that `F5` is just overriden for Hollywood files, so if you additionally code in other languages like JavaScript or TypeScript you don't override the default behaviour for those languages.

## Dark and Light Theme

![Dark Theme](https://raw.githubusercontent.com/JohnArcher/vscode-hollywood-mal/master/media/dark_theme.png)

*Dark Theme*

![Light Theme](https://raw.githubusercontent.com/JohnArcher/vscode-hollywood-mal/master/media/light_theme.png)

*Light Theme*

There are two ways to **activate or switch** the theme:

1. Via Extension Pane
   1. Go to the Extension pane and look for the Hollywood extension
   2. Click on the Manage icon and chosse `Set Color Theme`
   3. Now select `Hollywood (Dark)` or `Hollywood (Light)`
2. Via Command Palette
   1. Press `Ctrl+Shift+P` to show the Command Palette
   2. Enter `Color Theme`
   3. Pick `Hollywood (Dark)` or `Hollywood (Light)` from the list

## Intellisense

IntelliSense is a general term for various code editing features like code completion, quick info, and some more. This plugin currently provides code completion and quick info support (with **extensive help**) for all inbuilt Hollywood functions includig preprocessor commands and constants (no help texts for those).

As soon as you start typing, a box with matching commands is opened. Pressing `Tab` or `Enter` will insert the selected entry, often with placeholders for all required parameters.

![Intellisense](https://raw.githubusercontent.com/JohnArcher/vscode-hollywood-mal/master/media/intellisense_code_completion.gif)

Additonally you will see the quick help section for each command. If that is not the case or you want to hide this box, simply press `Ctrl+Space`.

If you right away press `Ctrl+Space`, a complete list of all functions, preprocessor commands and constants is shown.

**Notice:** Loading this amount of definition data for code completion and quick help could initally take some time when you opening or creating a project.

### Path completion

Inside the quotes of a preprocessor command that names a file, the list shows the files next to your script instead of the Hollywood commands:

```hws
@INCLUDE "lib/|"
```

Picking a folder opens the list again, so you can walk a path one step at a time; `../` leads upwards. Paths are resolved relative to the script you are editing, which is how Hollywood resolves them as well.

`@INCLUDE` and `@APPENTRY` list Hollywood sources (`.hws`, `.hwa`) except the script you are editing, which could only include itself, `@DIRECTORY` lists folders, and the commands loading media — `@ANIM`, `@APPICON`, `@BGPIC`, `@BRUSH`, `@CATALOG`, `@FILE`, `@ICON`, `@MUSIC`, `@PALETTE`, `@SAMPLE`, `@SPRITE`, `@VIDEO` — list every file, because which formats can be loaded depends on the platform and installed plugins.

## Go to definition

This feature lets you jump to variable, constant, or function definitions/declarations by pressing `F12` when on a proper symbol. This is also possible with `Ctrl+Click` on a symbol.
If your files are organized in a workspace, all workspace files are used.

If you hover over a symbol and press `Ctrl` you see a preview of the declaration.

![Go to definition](https://raw.githubusercontent.com/JohnArcher/vscode-hollywood-mal/master/media/go_to_definition.gif)

For additonal information see [the official Visual Studio Code documentation](https://code.visualstudio.com/Docs/editor/editingevolved#_go-to-definition)

## Document Symbols/Go to Symbol

All defined/declared document symbols (variables, constants, functions) are shown in the [Outline view](https://code.visualstudio.com/docs/getstarted/userinterface#_outline-view) and [Breadcrump view](https://code.visualstudio.com/Docs/editor/editingevolved#_breadcrumbs) which can also be used for code navigation.

Keep in mind that only variables introduced by `Local` or `Global` are taken into account.

![Outline view](https://raw.githubusercontent.com/JohnArcher/vscode-hollywood-mal/master/media/outline_view.png)

Each symbol is represented by its own icon:

![Global variable](https://raw.githubusercontent.com/JohnArcher/vscode-hollywood-mal/master/media/global_symbol.png)

![Local variable](https://raw.githubusercontent.com/JohnArcher/vscode-hollywood-mal/master/media/local_symbol.png)

![Function](https://raw.githubusercontent.com/JohnArcher/vscode-hollywood-mal/master/media/function_symbol.png)

You can also show a list of all symbols (also for navigating) by `Ctrl+Shift+O` (alternatively: `Ctrl+P` followed by the `@` sign). Then, if you type `:`, the symbols will be grouped.

![Go to symbol](https://raw.githubusercontent.com/JohnArcher/vscode-hollywood-mal/master/media/go_to_symbol.gif)

For additonal information see [the official Visual Studio Code documentation](https://code.visualstudio.com/Docs/editor/editingevolved#_go-to-symbol)

## Code Snippets

You can use code snippets to quickly generate code patterns you regularly need, like function definitions, loops and so on. Please have a look at the [Snippets section](snippets.md) for a list of all supported snippets.

## Thank you

I would like to thank the following people for their help, support and donations:

* Michael Rupp ([mrupp12bit](https://github.com/mrupp12bit)), creator of [TAWS - The Amiga Workbench Simulation](https://www.taws.ch/) and [SonosController](http://aminet.net/search?query=SonosController)
* [midwan](https://github.com/midwan)
* *root* from a1k.org
* Andreas Falkenhahn for his support and creating [Hollywood](https://www.hollywood-mal.com)
* Thomas Kölsch
* Nick Sommer
* Both of my two AmigaSons for interest and motivation and my wife for understanding and providing free time for my hobby

## Support

If this extension is helpful to you and you want to support me feel free to [buy me a coffee](https://ko-fi.com/johnarcher) or send a tip [via PayPal](https://paypal.me/cptjohnarcher).

If you find a bug or want to see a feature added, please fill an [Issue on the GitHub page](https://github.com/JohnArcher/vscode-hollywood-mal/issues). I try my best to improve this extension.

## TODOs / Future

This extension is far from complete or bug free. The overall goal is: Provide nearly or the same feature subset as the official Hollywood IDE for Windows and hw4cubic for Amiga.

This includes and adds:

* inline help / paramter info [here](https://code.visualstudio.com/api/language-extensions/programmatic-language-features#help-with-function-and-method-signatures) and [here](https://code.visualstudio.com/api/language-extensions/programmatic-language-features#help-with-function-and-method-signatures)
* more snippets
* Commands (Contribution point)
* Menus (Contribution point)
* Help (press F1 or similar and help file gets loaded with word under cursor)
* Code completion for Hollywood plugins
* ...

## Disclaimer on the use of AI

Until version 10 of this plugin all work was done by myself with no use of AI. Even when the development of version 11 started, I didn't use AI. But when I thought work was about 80% done, health issues and a lack of motivation started to kick in. After months, my initial plan was to use Claude Code just to get the release done — and it helped A LOT to find problems with the current state of the Hollywood 11 integration, things that would have taken ages to find if ever. Claude also found my todo file (of course) and proposed an approach for some of the entries. So it helped a lot in turning my prototype into a real implementation of the "path completion" feature. Again it saved me so much time and helped fuel my motivation to steadily improve this plugin.

So bear with me if I use AI to a certain degree; in my opinion it is worth it if that gives you folks a better Hollywood dev experience.