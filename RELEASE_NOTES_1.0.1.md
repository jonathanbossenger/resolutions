# Release Notes for v1.0.1

## Overview
Version 1.0.1 is a minor update that includes new features, improvements, and bug fixes based on user feedback and community contributions.

## What's New in v1.0.1

### New Features

#### 1. Most Used Resolutions Tracking
- **Automatic tracking**: Every time you switch a resolution, the app automatically tracks your choice
- **Smart menu organization**: Up to 5 most frequently used resolutions appear in a dedicated "Most Used Resolutions" section at the top of each display's menu
- **No duplicates**: Resolutions shown in "Most Used" are removed from the "Available Resolutions" list to avoid confusion
- **Per-display tracking**: Each monitor independently tracks its frequently used resolutions

#### 2. Launch at Login
- **Easy startup**: New "Launch at Login" option in the menu allows you to configure the app to start automatically when you log into macOS
- **Simple toggle**: Just click the checkbox in the menu to enable or disable
- **Defaults to OFF**: Users must opt-in to this feature
- **Syncs with system preferences**: The setting integrates with macOS Login Items

#### 3. Menu Bar-Only Mode
- **No Dock icon**: The app now runs as a true menu bar utility without showing a Dock icon
- **Cleaner experience**: No Cmd+Tab entry, just a lightweight menu bar presence
- **Professional**: Follows macOS best practices for menu bar applications

### Improvements

#### Documentation Updates
- **Simplified installation**: Changed displayplacer installation command from the verbose `brew install jakehilborn/jakehilborn/displayplacer` to the simpler `brew install displayplacer`
- **Homebrew links**: Added links to https://brew.sh/ throughout the documentation to help users who don't have Homebrew installed yet
- **Updated files**: README.md, QUICKSTART.md, CONTRIBUTING.md, RELEASES.md, and error messages in main.js

### Bug Fixes
- Corrected displayplacer installation instructions across all documentation

## How to Create the Release

### Prerequisites
- All changes are committed and merged to the main branch
- Version has been updated to 1.0.1 in package.json
- CHANGELOG.md has been created and documents all changes

### Release Process

Once this PR is merged to main, follow these steps:

1. **Checkout main branch and pull latest changes**
   ```bash
   git checkout main
   git pull origin main
   ```

2. **Create and push the v1.0.1 tag**
   ```bash
   git tag v1.0.1
   git push origin v1.0.1
   ```

3. **Monitor the GitHub Actions workflow**
   - Go to the "Actions" tab in the repository
   - Watch the "Build Release" workflow progress
   - The workflow will:
     - Build installers for both Apple Silicon (arm64) and Intel (x64)
     - Create DMG disk images and ZIP archives
     - Automatically create a GitHub release
     - Attach all installers to the release

4. **Update the release notes** (optional)
   - Once the release is created, you can edit it to add more detailed release notes
   - Consider copying content from CHANGELOG.md

## Downloads

After the release is created, users can download:
- **For Apple Silicon Macs (M1, M2, M3, etc.)**: `Resolutions-1.0.1-arm64.dmg`
- **For Intel Macs**: `Resolutions-1.0.1-x64.dmg`

## Testing Checklist

Before finalizing the release, ensure:
- [x] Version number updated in package.json
- [x] CHANGELOG.md created and complete
- [x] All tests pass (no formal tests, but code validated)
- [x] No syntax errors in JavaScript files
- [x] Dependencies are up to date
- [x] GitHub Actions workflow is configured correctly

## Migration Notes

Users upgrading from v1.0.0 to v1.0.1:
- No breaking changes
- Existing saved resolutions will continue to work
- New tracking data will be added to preferences.json automatically
- Launch at Login defaults to OFF (users must enable it manually if desired)
- Dock icon will be hidden after installing the new version (this is a feature, not a bug!)

## Support

If users encounter any issues:
1. Check the QUICKSTART.md guide
2. Verify displayplacer is installed: `which displayplacer`
3. Review the RELEASES.md troubleshooting section
4. File an issue on GitHub with detailed information
