# CHANGELOG

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html)

## [0.8.0]
### Added
* websocket debug panel for inspecting active rooms, Yjs documents and awareness state #27596
* send refetch signal after successful form submit so live preview can reload saved content #27596

### Changed
* redesigned websocket integration to work with the new collaboration gateway #27596
* generated live preview URLs now include `identifyingFields` resolved from the route template #27596

### Fixed
* array editing no longer removes objects from the Yjs document unexpectedly
* colors assigned to editor no longer produce incorrect lightness value
* changes made in list object will no longer remove the remaining list items
* connection is now correctly closed only for the edited document
* connection is now correctly reestablished when any network failures happen while working on the document

## [0.7.4]
### Fixed
* updating relations #27291

## [0.7.3]
### Changed
* refactor form events to use new form API #27220

## [0.7.2]
### Changed
* `Client Authorization key` is no longer required #26939
* `Client Authorization key` is passed as `editor_key` URL param #26939

## [0.7.1]
### Added
* from now, if URL has search param livePreviewOpened set to "true", the live preview panel will be automatically opened #26915

## [0.7.0]
### Added
* editing object from relation modal is sending information to the live preview #26808

### Changed
* open appliaction iframe on live preview button click #26808

### Fixed
* from now, array item replacement is in one transation (before it was in two transactions: delete and insert)

## [0.6.0]
### Added
* support for list fields #26780

## [0.5.0]
### Changed
* adjusted plugin to new form api #26710

## [0.4.0]
### Fixed
* when multilingual is adding new tranlsation, plugin will store whole translation field instead of just language #26441

### Changed
* plugin will listen to `flotiq-multilingual.translation::changed` event (in previous multilingual plugin version it was `flotiq-multilingual.translation::added`) #26441

## [0.3.0]
### Fixed
* storing nested objects in yjs doc #26528

### Added
* translation field on translations add #26528

## [0.2.1]
### Changed
* remove throttle on field change #26528

## [0.2.0]
### Changed
* URL to live preview #26528

### Removed
* broadcasting changes to space-white room #26528

## [0.1.5]
### Changed
* set active field on focus intead of on change #26504

## [0.1.4]
### Added
* Use throttling instead of debounce in form #26476

## [0.1.3]
### Added
* UI and components image to readme

## [0.1.2]
### Added
* panel with disabled button when creating new content

## [0.1.1]
### Added
* info about nextjs-live-preview to readme

## [0.1.0]
### Added
* sending live preview data to websocket
* plugin configuration
* button to open live preview to sidebar panel
