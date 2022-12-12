# Change Log

All notable changes to the "hw4vsc" extension will be documented in this file.

## [9.2.0] - *unreleased*

### Added

- New setting `hollywood.mainOutputFile` for defining the the name of the compiled program added. Reason for this is, that the former setting `$fileBasenameNoExtension}` didn't work as idented when a different file than the actual main file was focused/active in Visual Studio Code.
- Added or updated the corresponding documentation and [tasks.json](https://github.com/JohnArcher/vscode-hollywood-mal/blob/master/exampleFiles/tasks.json)

## [9.1.2] - 2022-12-12

### Fixed

- Fixed change to `hollywood.outputExeType` from version 8.0.0 in example file for [tasks.json](https://github.com/JohnArcher/vscode-hollywood-mal/blob/master/exampleFiles/tasks.json) and README.md
- Fixed multiple extetypes options in example file for [tasks.json](https://github.com/JohnArcher/vscode-hollywood-mal/blob/master/exampleFiles/tasks.json)

## [9.1.1] - 2022-09-03

### Added

- Added new keywords (commands, constants) for Hollywood 9.1

## [9.1.0] - 2022-03-20

### Added

- [Got to Definition](https://code.visualstudio.com/Docs/editor/editingevolved#_go-to-definition) works with all workspace files now

### Fixed

- Fixed wrong coloring of `@ELSEIF` ([#22](https://github.com/JohnArcher/vscode-hollywood-mal/issues/22))

## [9.0.1]

### Changed

- CamelCase [snippets](snippets.md) prefixes / trigger (like `funcLocal`) words have been droped in favor of only kabab-case style (#15)

## [9.0.0]

### Added

- Added new Hollywood keywords (commands, constants, preprocessors)

## [8.0.4] - 2021-04-07

### Added

- Added Symbol support for displaying variables, constants, and functions in the [Outline view](https://code.visualstudio.com/docs/getstarted/userinterface#_outline-view), [Breadcrumps](https://code.visualstudio.com/Docs/editor/editingevolved#_breadcrumbs), and [Got to Symbol](https://code.visualstudio.com/Docs/editor/editingevolved#_go-to-symbol) (thanks to [mrupp12bit](https://github.com/mrupp12bit))
- Added support for [Got to Definition](https://code.visualstudio.com/Docs/editor/editingevolved#_go-to-definition) (thanks to [mrupp12bit](https://github.com/mrupp12bit))
- Added Syntax Highlighting for MulitLine strings
- Overall improved Syntax Highlighting

### Changed

- Intellisense does recognize variable names with $ and ! now (#6)

## [8.0.3] - 2020-06-01

### Added

- Added 3 snippets for creating Switch-Case-statements (`switch`, `switch-default`, `switch-fallthrough`)
- Added 2 snippet for defining a function with a prefix (`func-p`, `func-local-p`)
- Added additional snippet prefixes / trigger words for the following snippets (the previous prefixes are still valid):
  - `debug-string` for debug printing a string
  - `debug-var` for debug printing a variable
  - `repeat-forever` for a Repeat-Forever-loop
  - `func-local` for defining a local function
  - `func-self` for defining a self function

## [8.0.2] - 2020-05-14

### Added

- Added documentation remark about starting a script with F5
- Added 3 snippets for declaring an app icon (`@APPICON`)

### Changed

- Changed README.md and example task.json as there is a better way to start a task with arguments which also fixes the problem with spaces in the `hollywood.exePath` setting (thanks to [midwan](https://github.com/midwan) and *root* from a1k.org).
- Changed default built task in README.md and the example task.json to the `"Compile Hollywood Main script to default target"` task, as this is more natural. Starting a task can be triggered with F5 now.

## [8.0.1] - 2020-05-03

- Initial public release

## [8.0.0] - 2020-05-02

### Added

- Added documentation for code snippets
- Added links to Ko-fi and PayPal

## [8.0.0] - 2020-05-01

### Added

- New setting `hollywood.mainFile` for defining the project's main file added.
- New setting `hollywood.exePath` for defining the path to the Hollywood executeable
- Added new snippets for defining functions
- Added an example file for tasks.json

### Changed

- Changed setting `hollywood.OutputExeTypes` to `hollywood.outputExeType`

## [0.3.0] - 2020-04-25

### Added

- First version of snippets (DebugPrint, Repeat-Forever)

### Changed

- Changed commands, constants, and preprocessors from Hollywood 7.1 to Hollywood 8

## [0.2.1] - 2019-02-27

### Added

- New setting `hollywood.OutputExeTypes` for defining the output type including easy picking of available types and displaying their descriptions (taken from the official Hollywood documentation)

![Configuration of hollywood.OutputExeTypes](https://raw.githubusercontent.com/JohnArcher/vscode-hollywood-mal/dev/media/configuration_outputexetype.png)

## [0.2.0] - 2019-02-22

### Added

- Dark and Light color theme

## [0.0.1] - 2019-02-04

### Added

- Basic configuration for comments, brackets and so forth
- Hollywood syntax hightlighting and grammar with keywords and function for Hollywood 7
