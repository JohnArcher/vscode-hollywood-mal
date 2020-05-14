# Change Log

All notable changes to the "hw4vsc" extension will be documented in this file.

## [Unreleased]

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
