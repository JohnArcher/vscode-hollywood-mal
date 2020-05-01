# Hollywood for Visual Studio Code (hw4vsc)

**DISCLAIMER:** This is not an official product by Airsoft Software.

This extension adds support for [Hollywood](https://www.hollywood-mal.com) **version 8** to Visual Studio Code (Windows, macOS, Linux). Hollywood is a multimedia-oriented programming language designed to create applications and games and is available for AmigaOS, Windows, macOS, and Linux. Hollywood (and therefore this extension) is capable of compiling to the following target plattforms:

* AmigaOS
* Android
* AROS
* iOS
* Linux
* macOS
* MophOS
* WarpOS
* Windows

In order to make use of the extension you need to buy a copy of Hollywood here: <https://www.hollywood-mal.com/purchase.html>

More information about Hollywood is available here: <https://www.hollywood-mal.com>

You can find the Hollywood documentation here: <https://www.hollywood-mal.com/docs/html/hollywood/>

*NOTICE*: The version number of this plugin correspondes with the version number of Hollywood. Therefore the first release version of this extension is 8.0.0.

## Features

First of all you can use the great inbuilt editing features of Visual Studio Code like Multi-Cursor, easy code editing (like line cloning, deletion, and swapping), bracket matching and so forth. Please consult the [Visual Studio Code documentation](https://code.visualstudio.com/docs) for more infos.

Additionally this extension supports:

* Hollywood specific syntax highlighting (Light and Dark theme)
* Hollywood specific code snippets
* Code indention
* Code folding

## Installation

There are several ways to install this extension:

1. Install and open [Visual Studio Code](https://code.visualstudio.com).
2. Press `Ctrl+Shift+X` or `Cmd+Shift+X` to open the Extensions pane or click on the corresponding button in the side bar.
3. Find the Hollywood extension (look for "Hollywood MAL") and click `Install`.

or

1. Download the latest release in the form of a `.vsix` file in this extensions [GitHub releases tab](https://github.com/JohnArcher/vscode-hollywood-mal/releases)
2. Open a command prompt (like cmd or PowerShell on Windows), navigate to the downloaded extension and enter `code --install-extension hollywood-mal-8.0.0.vsix`, where `hollywood-mal-8.0.0.vsix` has to be the name of the downloaded file.

or

Download/check out the content of the GitHub repo and copy it to your extension folder:

* **Windows:** `%USERPROFILE%\.vscode\extensions`
* **macOS:** `~/.vscode/extensions`
* **Linux:** `~/.vscode/extensions`

## Configuration

 Open User or Wokspace Settings by pressing `Ctrl+Shift+P` and enter `settings` or open the extension pane, click the *manage* icon on the Hollywood extension and select *Extension Settings*. Please consult the docs for [creating User and Workspace settings](https://code.visualstudio.com/docs/getstarted/settings)

### Path to Hollywood executeable

Setting: `hollywood.exePath`

Normally this should be a **User** Setting (and not a Workspace Setting), so the executeable is defined globally for all your Hollywood projects.

![Configuration of hollywood.exePath in Settings](https://raw.githubusercontent.com/JohnArcher/vscode-hollywood-mal/dev/media/configuration_exepath.png)

Example in  *settings.json*: `"hollywood.exePath": "C:\Program Files\Hollywood\Hollywood.exe"`

Now open a `.hws` file. The extension is activated now.

### Define main file

Setting: `hollywood.mainFile`

Whether your Hollywood project consists of one or more files, you should define the main Hollwood file of your project. This will help you compiling and running your project via Tasks (see below).

This is a setting that should be defined as a Workspace Setting (so create a Worspace first if you haven't down it yet (`File` -> `Save Workspace as ...`)).

![Configuration of hollywood.mainFile in Settings](https://raw.githubusercontent.com/JohnArcher/vscode-hollywood-mal/dev/media/configuration_mainfile.png)

Example in *YOUR_PROJECT.code-workspace*: `"hollywood.mainFile": "mainApp.hws"`

### Define standard executable output format

Setting: `hollywood.outputExeType`

This setting specifies the output format of the executable that the Hollywood compiler shall create.

The best approach is to define this in the **user** settings (so it is defined globally for all your projects) and override it in **workspace** settings if needed, so you can have different output formats for different workspaces/projects.

![Configuration of hollywood.outputExeType in Settings](https://raw.githubusercontent.com/JohnArcher/vscode-hollywood-mal/dev/media/configuration_outputexetype.png)

Example in *YOUR_PROJECT.code-workspace*: `"hollywood.outputExeType": "classic"`

In order to define multiple targets, e.g. `win64|classic|morphos`, you have to create a separate Task (see description below or have a look for [the example file](https://github.com/JohnArcher/vscode-hollywood-mal/blob/dev/exampleFiles/tasks.json).

For a complete list of all output formats check the `-exetype` console argument under <https://www.hollywood-mal.com/docs/html/hollywood/ManualUsage.html>

## Run and compile

You have to create Tasks in Visual Studio Code in order to run or compile a Hollywood file or project. It is recommended to read the [official Visual Studio Code documentation for Tasks](https://code.visualstudio.com/docs/editor/tasks).

### Create Tasks

TODO

### Run task

TODO

## TODOs / Future

Overall goal: Provide nearly the same feature subset as the official Hollywood IDE for Windows

This includes and adds:

* Code Completion, also for # and @
* more snippets
* Commands (Contribution point)
* Menus (Contribution point)
* Help (press F1 or similar and help file gets loaded with word under cursor)
* Quick Help
* Function detection and listing (Strg + P, AltGr + q)
* ...
