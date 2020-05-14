# Snippets

This is a list of all Hollywood specific code snippets you can use while developing. Snippets are templates that make it easier to enter repeating code patterns. You can finde more information and on how to use [Snippets in Visual Studio Code here](https://code.visualstudio.com/docs/editor/userdefinedsnippets).

When you enter the snippet prefix listed below a popup window is triggered so you can easily add the template text into the current position in you code by pressing Enter or TAB:

![Example of a Hollywood specific snippet](https://raw.githubusercontent.com/JohnArcher/vscode-hollywood-mal/dev/media/snippet_example.png)

## Table of Contents <!-- omit in toc -->

* [Snippets](#snippets)
  * [`app-icon-path`](#app-icon-path)
  * [`app-icon-table`](#app-icon-table)
  * [`app-icon-table-selected`](#app-icon-table-selected)
  * [`repfo`](#repfo)
  * [`func`](#func)
  * [`funcLocal`](#funclocal)
  * [`funcSelf`](#funcself)
  * [`dps`](#dps)
  * [`dpv`](#dpv)

## `app-icon-path`

Declare an application icon by path which has to be created with `SaveIcon()` before.

```
@APPICON "pathToIcon"
```

## `app-icon-table`

Declare an application icon by a table.

![Snippet app-icon-table](https://raw.githubusercontent.com/JohnArcher/vscode-hollywood-mal/master/media/snippet-app-icon-table.gif)

```
@APPICON {
    Ic16x16 = "pathToIcon16x16.png",
    Ic24x24 = "pathToIcon24x24.png",
    Ic32x32 = "pathToIcon32x32.png",
    Ic48x48 = "pathToIcon48x48.png",
    Ic64x64 = "pathToIcon64x64.png",
    Ic96x96 = "pathToIcon96x96.png",
    Ic128x128 = "pathToIcon128x128.png",
    Ic256x256 = "pathToIcon256x256.png",
    Ic512x512 = "pathToIcon512x512.png",
    Ic1024x1024 = "pathToIcon1024x1024.png",
    DefaultIcon = "64x64"
}
```

## `app-icon-table-selected`

Declare an application icon by a table which also contains icons for the selected state **(Amiga-only)**.

```
@APPICON {
    Ic16x16 = "pathToIcon16x16.png",
    Ic16x16s = "pathToIcon16x16s.png",
    Ic24x24 = "pathToIcon24x24.png",
    Ic24x24s = "pathToIcon24x24s.png",
    Ic32x32 = "pathToIcon32x32.png",
    Ic32x32s = "pathToIcon32x32s.png",
    Ic48x48 = "pathToIcon48x48.png",
    Ic48x48s = "pathToIcon48x48s.png",
    Ic64x64 = "pathToIcon64x64.png",
    Ic64x64s = "pathToIcon64x64s.png",
    Ic96x96 = "pathToIcon96x96.png",
    Ic96x96s = "pathToIcon96x96s.png",
    Ic128x128 = "pathToIcon128x128.png",
    Ic128x128s = "pathToIcon128x128s.png",
    Ic256x256 = "pathToIcon256x256.png",
    Ic256x256s = "pathToIcon256x256s.png",
    Ic512x512 = "pathToIcon512x512.png",
    Ic512x512s = "pathToIcon512x512s.png",
    Ic1024x1024 = "pathToIcon1024x1024.png",
    Ic1024x1024s = "pathToIcon1024x1024s.png",
    DefaultIcon = "64x64"
}
```

## `repfo`

Inserts the Repeat-WaitEvent-Forever Loop:

```
Repeat
    WaitEvent
Forever
```

## `func`

Defines a new function:

```
Function name(parameters)

EndFunction
```

## `funcLocal`

Defines a new local function:

```
Local Function name(parameters)

EndFunction
```

## `funcSelf`

Defines a new self function:

```
Function self.name(parameters)

EndFunction
```

## `dps`

Prints a string to the debug console:

```
DebugPrint("string")
```

## `dpv`

Prints a variable to the debug console:

```
DebugPrint("variable", variable)
```
