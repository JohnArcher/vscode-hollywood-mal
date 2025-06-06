# Hollywood for Visual Studio Code (hw4vsc)

**DISCLAIMER:** This is not an official product by Airsoft Softwair.

This extension adds support for [Hollywood](https://www.hollywood-mal.com) **version 10: Xcelicious** to Visual Studio Code (Windows, macOS, Linux). Hollywood is a multimedia-oriented programming language designed to create applications and games and is available for AmigaOS, Windows, macOS, and Linux. Hollywood (and therefore this extension) is capable of compiling to the following target plattforms:

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
    * [Define main file](#define-main-file)
    * [Define main output file](#define-main-output-file)
    * [Define standard executable output format](#define-standard-executable-output-format)
  * [Run and compile](#run-and-compile)
    * [Create Tasks](#create-tasks)
    * [Configure Tasks](#configure-tasks)
    * [Run a Task](#run-a-task)
    * [Run a script with F5](#run-a-script-with-f5)
  * [Dark and Light Theme](#dark-and-light-theme)
  * [Intellisense](#intellisense)
  * [Go to definition](#go-to-definition)
  * [Document Symbols/Go to Symbol](#document-symbolsgo-to-symbol)
  * [Code Snippets](#code-snippets)
  * [Thank you](#thank-you)
  * [Support](#support)
  * [TODOs / Future](#todos--future)

## Features

First of all you can use the great inbuilt editing features of Visual Studio Code like quick file navigation including fuzzy search (press `Ctrl + P`), Multi-Cursor, easy code editing (like line cloning, deletion, and swapping), project/workspace support, bracket matching and so forth. Please consult the [Visual Studio Code documentation](https://code.visualstudio.com/docs) for more infos.

Additionally this extension supports:

* Hollywood specific syntax highlighting including a [Light and Dark Theme](#dark-and-light-theme)
* [Intellisense with code completion](#intellisense) of all inbuilt Hollywood functions/commands
* Hollywood specific [Code Snippets](#code-snippets)
* [Go to definition](#go-to-definition) functionallity for variables, constants, and functions
* [Document Symbols](#document-symbolsgo-to-symbol) for showing your variables, constants, and functions in the Outline and Breadcrump view and for easy code navigation
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
2. Open a command prompt (like cmd or PowerShell on Windows), navigate to the downloaded extension and enter `code --install-extension hollywood-mal-10.0.0.vsix`, where `hollywood-mal-10.0.0.vsix` has to be the name of the downloaded file.

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

## Run and compile

You have to create Tasks in Visual Studio Code in order to run or compile a Hollywood file/project. For a deeper dive into Tasks it is recommended to read the [official Visual Studio Code documentation for Tasks](https://code.visualstudio.com/docs/editor/tasks).

### Create Tasks

For every project you have to create the task definitions. There are two ways to achieve this:

1. **Create** a **new** `tasks.json` file
   1. Press `Ctrl+Shift+X` or `Cmd+Shift+X` and enter `Configure Task`
   2. Select `Create tasks.json file from template`
   3. Select `Others`
   4. The freshly created `tasks.json` file is opened in Visual Studio Code. For later reference: This file is created in the `.vscode` folder of your project/workspace.
   5. Add new tasks or copy tasks from [the example file](https://github.com/JohnArcher/vscode-hollywood-mal/blob/master/exampleFiles/tasks.json).
2. **Clone** an exisiting `tasks.json` file
   1. Look for an exisiting `tasks.json` file in `.vscode` folder of another Hollywood project or download [the example file](https://github.com/JohnArcher/vscode-hollywood-mal/blob/master/exampleFiles/tasks.json) to your `.vscode` folder.
   2. Open the file and edit those defined tasks or add new ones.

### Configure Tasks

Several working tasks are shown in [the example file](https://github.com/JohnArcher/vscode-hollywood-mal/blob/master/exampleFiles/tasks.json), so be sure to consult the file.

A minimal task confguration consists of 4 or 5 properties.

1. `"label"`: This is the label you will see in the task list when you run a task.
2. `"type"`: Defines whether the task is run as a process or as a command inside a shell. Normally you set it to `"shell"`.
3. `"group"`: Defines to which execution group this task belongs. This is *optional*, but if you want to define a standard task (like building or running your project) which is easily accessable by pressing `Ctrl+Shift+B` you have to define such a group (see [the example file](https://github.com/JohnArcher/vscode-hollywood-mal/blob/master/exampleFiles/tasks.json)).
4. `"command"`: This is the actual command that is executed. Normally you will only use the configured path to the Hollywood executeable here, which is `${config:hollywood.exePath}` ([see here](#path-to-hollywood-executeable)).
5. `"args"`: This is an array which contains arguments passed to the command when the task is invoked. Besides several **inbuilt Visual Studio Code variables** like `${workspaceFolder}`, `${file}` and `${fileBasenameNoExtension}` and [Hollywood's command line arguments](https://www.hollywood-mal.com/docs/html/hollywood/ManualUsage.html) (like `-printerror` to print syntax errors into the **Terminal panel**) you can use the following **extension specific variables** (see the provided settings under [Configuration](#configuration)):
   1. `${config:hollywood.mainFile}`: The configured [main project file](#define-main-file)
   2. `${config:hollywood.mainOutputFile}`: The name of the [compiled program](#define-main-output-file)
   3. `${config:hollywood.outputExeType}`: The configured [standard output exe format](#define-standard-executable-output-format)

*NOTICE*: By default the current working directory is the current workspace root. If you ever need to change this for your task because your source code that has to be compiled is in a different folder you can change the current working directoy by using the `"cwd"` option (see [this link for details](https://code.visualstudio.com/docs/editor/tasks)).

This is a complete example of a task definition:

```json
{
    "label": "Compile Hollywood Main script to default target",
    "type": "shell",
    "command": "${config:hollywood.exePath}",
    "args": [
         "${config:hollywood.mainFile}",
         "-compile",
         "${config:hollywood.mainOutputFile}",
         "-exetype",
         "${config:hollywood.outputExeType}"
   ],
    "group": {
        "kind": "build",
        "isDefault": true
    }
}
```

### Run a Task

If you have set **default task** simple press `Ctrl+Shift+B` to run that specific task.

For all other tasks you have to follow these steps:

1. Press `Ctrl+Shift+P` to show the Command Palette
2. Enter `Run Task`
3. Pick the task you want to run
4. Select `Continue without scanning the task output` or `Never scan the task output for this task` if you want to ignore this message in the future

![Task picker](https://raw.githubusercontent.com/JohnArcher/vscode-hollywood-mal/master/media/run_task.png)

### Run a script with F5

If you have already worked with the official Hollywood IDE you may be used to press F5 to run the current script. You can adopt the same behaviour with this extension through overriding the keybinding. In this example we will run the project's [main script](#define-main-file) by starting the corresponding task [we created above](#configure-tasks) and you can see in the task.json example.

In order to override the setting you have to follow these steps:

1. Press `Ctrl+Shift+P` to show the Command Palette
2. Enter `Open Keyboard Shortcuts (JSON)`
3. The file `keybindings.json` which may be nearly empty is opened. Please copy the following code **between** `[` and `]` and save the file:

```json
{
   "key": "f5",
   "command": "workbench.action.tasks.runTask",
   "args": "Run Hollywood Main script",
   "when": "resourceLangId == hollywood"
}
```

It is important to set the `"args"` parameter exactely like the corresponding tasks `"label"` you configured in your `tasks.json`. Of course it is possible to start another task and/or use other keys (see the `"key"` parameter).

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

I would like to thank the following people for their help and support:

* Michael Rupp ([mrupp12bit](https://github.com/mrupp12bit)), creator of [TAWS - The Amiga Workbench Simulation](https://www.taws.ch/) and [SonosController](http://aminet.net/search?query=SonosController)
* [midwan](https://github.com/midwan)
* *root* from a1k.org
* Andreas Falkenhahn for his support and creating [Hollywood](https://www.hollywood-mal.com)
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
