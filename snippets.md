# Snippets

This is a list of all Hollywood specific code snippets you can use while developing. Snippets are templates that make it easier to enter repeating code patterns. You can finde more information and on how to use [Snippets in Visual Studio Code here](https://code.visualstudio.com/docs/editor/userdefinedsnippets).

When you enter the snippet prefix listed below a popup window is triggered so you can easily add the template text into the current position in you code by pressing Enter or TAB:

![Example of a Hollywood specific snippet](https://raw.githubusercontent.com/JohnArcher/vscode-hollywood-mal/dev/media/snippet_example.png)

## Table of Contents <!-- omit in toc -->

* [Snippets](#snippets)
  * [`repfo`](#repfo)
  * [`func`](#func)
  * [`funcLocal`](#funclocal)
  * [`funcSelf`](#funcself)
  * [`dps`](#dps)
  * [`dpv`](#dpv)

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
