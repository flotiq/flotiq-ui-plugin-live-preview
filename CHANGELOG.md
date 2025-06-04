# CHANGELOG

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html)

## [0.7.0]
### Changed
* open appliaction iframe on live preview button click #26808

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
