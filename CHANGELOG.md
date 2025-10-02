# Changelog

All notable changes to the Resolutions app will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.1] - 2025-10-02

### Added
- Automatic tracking of most frequently used resolutions per display
- "Most Used Resolutions" section in menu showing up to 5 most frequently selected resolutions
- Launch at Login option in menu (defaults to OFF)
- Menu bar-only mode with hidden Dock icon (LSUIElement configuration)

### Changed
- Simplified displayplacer installation instructions to use `brew install displayplacer`
- Added Homebrew website links throughout documentation for users who don't have it installed

### Fixed
- Corrected displayplacer installation command in README, QUICKSTART, CONTRIBUTING, RELEASES, and main.js

## [1.0.0] - 2025-10-01

### Added
- Initial release
- Menu bar tray application for macOS
- List all connected monitors with their names
- Display available resolutions per monitor
- Switch monitor resolution from menu
- Auto-refresh when monitors change (add/remove/metrics)
- Save and restore preferred resolutions per display
- Uses displayplacer for macOS display control
- Comprehensive error handling
- GitHub Actions workflow for automated builds (Apple Silicon and Intel)
- Documentation: README, QUICKSTART, CONTRIBUTING, PREFERENCES, RELEASES

[1.0.1]: https://github.com/jonathanbossenger/resolutions/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/jonathanbossenger/resolutions/releases/tag/v1.0.0
