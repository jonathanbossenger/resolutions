# Bundling displayplacer - Implementation Summary

## Overview

This implementation bundles the `displayplacer` binary with the Resolutions app, eliminating the need for users to manually install it via Homebrew.

## Flow Diagram

```
Development Mode (npm start):
┌─────────────────────────────────────┐
│  App starts                         │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Check: ./resources/displayplacer   │
└──────────────┬──────────────────────┘
               │
        ┌──────┴──────┐
        │             │
      Found       Not Found
        │             │
        ▼             ▼
    Use it    Check system paths
                (/opt/homebrew/bin,
                 /usr/local/bin)
                      │
                      ▼
                  Use system
                  displayplacer

Production Build (npm run build:mac):
┌─────────────────────────────────────┐
│  prebuild script runs               │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Check if on macOS                  │
└──────────────┬──────────────────────┘
               │
        ┌──────┴──────┐
        │             │
      macOS       Not macOS
        │             │
        ▼             ▼
┌─────────────┐   Exit OK
│ Find/copy   │   (CI will
│ displayplacer│   handle it)
│ to resources/│
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────┐
│  electron-builder packages app      │
│  with resources/ as extraResources  │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  DMG contains bundled displayplacer │
└─────────────────────────────────────┘

User Installation:
┌─────────────────────────────────────┐
│  User downloads DMG                 │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Installs to /Applications          │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  App runs with bundled binary       │
│  No manual installation needed! ✓   │
└─────────────────────────────────────┘
```

## Changes Made

### 1. Build Script (`scripts/build-displayplacer.sh`)

Created a shell script that:
- Checks if running on macOS (displayplacer can only be built on macOS)
- On non-macOS systems: exits gracefully with a message
- On macOS:
  - Checks if displayplacer binary already exists in resources/
  - Tries to copy from system if already installed via Homebrew
  - Falls back to building from source if not installed
  - Places the binary in `resources/displayplacer`

### 2. Package Configuration (`package.json`)

Updated build scripts:
- Added `prebuild` script that runs before all build commands
- All build commands now automatically prepare displayplacer before building
- Added electron-builder configuration to include `resources/` as extra resources
- Excluded `scripts/` directory from the final build

### 3. Display Helper Updates (`display-helper.js`)

Modified `findDisplayPlacerPath()` function to:
- First check for bundled displayplacer binary (in production: app.asar.unpacked, in dev: ./resources/)
- Fall back to Homebrew installation paths if bundled version not found
- Maintain backward compatibility with system-installed versions

### 4. CI/CD Workflow (`.github/workflows/release.yml`)

Added step to install displayplacer before building:
- Ensures displayplacer is available during the build process
- The build script then copies it to resources/
- Electron builder includes it in the final app bundle

### 5. Documentation Updates

Updated all documentation files:
- **README.md**: Added section for pre-built installers, noted displayplacer is bundled
- **QUICKSTART.md**: Updated installation instructions, noted bundled binary
- **CONTRIBUTING.md**: Clarified development vs production setup
- **resources/README.md**: Added comprehensive documentation about the bundling approach

### 6. Git Configuration

Updated `.gitignore` to exclude the generated `resources/displayplacer` binary from version control.

## How It Works

### Development Mode

When running `npm start` or `npm run dev`:
1. App checks for bundled displayplacer at `./resources/displayplacer`
2. If not found, falls back to system-installed displayplacer
3. Developers can use system-installed version without bundling

### Production Build

When building with `npm run build:mac`:
1. `prebuild` script runs `scripts/build-displayplacer.sh`
2. Script copies displayplacer from system to `resources/`
3. Electron builder packages the app with `extraResources` configuration
4. Binary is included in the `.app` bundle at `Resources/resources/displayplacer`
5. App runtime checks for bundled version first, then system paths

### CI/CD Pipeline

GitHub Actions workflow:
1. Installs displayplacer via Homebrew
2. Runs build process which copies binary to resources/
3. Creates DMG installer with bundled displayplacer
4. Users who download the DMG get displayplacer pre-bundled

## Benefits

1. **Better User Experience**: No manual installation required
2. **Simplified Setup**: One-click installation via DMG
3. **Consistent Behavior**: Same version across all installations
4. **Backward Compatible**: Still works with system-installed displayplacer
5. **Cross-Architecture Support**: Works for both Intel and Apple Silicon

## License Compliance

displayplacer is MIT licensed, allowing redistribution. The resources/README.md file includes proper attribution to the original project.

## Testing

The implementation can be tested in several ways:

1. **Development**: Run `npm start` - should work with system displayplacer
2. **Build Test**: Run `npm run build:mac` on macOS - should bundle the binary
3. **Runtime Test**: Install the built DMG and verify app works without system displayplacer
4. **CI Test**: Push changes and verify GitHub Actions build succeeds

## Future Considerations

- Consider adding version checking to notify users of updates
- Could add auto-update for the bundled binary
- May want to add integrity checks for the bundled binary

## Troubleshooting

### Build fails with "displayplacer not found"

**On macOS:**
```bash
brew install displayplacer
npm run build:mac
```

**On CI/CD:**
Ensure the workflow includes the displayplacer installation step (already added in .github/workflows/release.yml)

### Binary not found in production app

Check that:
1. `resources/displayplacer` exists after build
2. `extraResources` is configured in package.json
3. The app is checking the correct path (`process.resourcesPath` in production)

### "Permission denied" when running bundled binary

The build script should set executable permissions. If not, manually:
```bash
chmod +x resources/displayplacer
```

### Different behavior in development vs production

This is expected! Development uses system paths first, production uses bundled binary first. Both modes support fallback to system installation.

