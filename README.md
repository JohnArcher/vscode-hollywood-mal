# Hollywood MAL for Visual Studio Code

This extension adds support for [Hollywood](https://www.hollywood-mal.com) 7.1 to Visual Studio Code (Windows, macOS, Linux). Hollywood is a programming language available for AmigaOS, Windows, macOS, and Linux and is capable of compiling to the following target plattforms:

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

## Features

First of all you can use the great inbuilt editing features of Visual Studio Code like Multi-Cursor, easy code edition (like line cloning, deletion, and swapping), bracket matching and so forth. Please consult the [Visual Studio Code documentation](https://code.visualstudio.com/docs) for more infos.

Additionally this extension supports:

* Hollywood specific syntax highlighting (Light and Dark theme)
* Code indention
* Code folding

## Installation

1. Install and open [Visual Studio Code](https://code.visualstudio.com). 
2. Press `Ctrl+Shift+X` or `Cmd+Shift+X` to open the Extensions pane or click on the corresponding button in the side bar.
3. Find the Hollywood extension (look for "Hollywood MAL") and click `Install`. You can also install the extension from the [Visual Studio Code Marketplace](https://marketplace.visualstudio.com/items?itemName=ms-vscode.Go) -> TODO!!!

or

Download/check out the content of this repo and copy it to your extension folder:

* **Windows:** `%USERPROFILE%\.vscode\extensions`
* **macOS:** `~/.vscode/extensions`
* **Linux:** `~/.vscode/extensions`

## Configuration

Open user or wokspace settings and define the path to the Hollywood executebale. Look for the option `hollywood.Path` or add it in `settings.json`.

Example (for Windows): `"hollywood.Path": "C:\Program Files\Hollywood\Hollywood.exe"`

Now open a `.hws` file. The extension is activated now.

## Add tasks

### Run task

## TODOs / Future

Overall goal: Provide nearly the same feature subset as the official Hollywood IDE for Windows

* Licence (incl. parts copyright by Airsoft Software )
* Icon: <https://code.visualstudio.com/api/extension-guides/icon-theme>
* See "Hollywood IDE" -> Settings -> Hollywood
* File similar to https://code.visualstudio.com/docs/nodejs/working-with-javascript#_javascript-projects-jsconfigjson for at least defining the main file of the project (which gets compile by the proper task). And/or just package.json property.
* Code Completion
* Code Completion, also for # and @
* Possible? -> "And "#Col" will popup all colors constants or "#EVENTS" will popup all possible event flags." (like in Flow Studio)
* Snippets
* Commands (Contribution point)
* Menus (Contribution point)
* Help (press F1 or similar and help file gets loaded with word under cursor)
* Quick Help
* Function detection and listing (Strg + P, AltGr + q)
* Build task
* Hollywood 8 support
