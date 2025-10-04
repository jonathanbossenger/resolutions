# Testing the displayplacer Bundling Implementation

This guide explains how to verify that displayplacer bundling is working correctly.

## Quick Verification

Run the automated test suite:
```bash
npm install
node scripts/test-bundling.js
```

Expected output:
```
✅ All tests passed!
```

## Development Testing (on macOS)

### 1. Test with System displayplacer

```bash
# Install displayplacer if not already installed
brew install displayplacer

# Run the app
npm start
```

Check the console output - it should show:
```
Using bundled displayplacer: /path/to/resources/displayplacer
```
or
```
Bundled displayplacer not found, checking system paths...
```

### 2. Test the Build Script

```bash
# Run the build script manually
bash scripts/build-displayplacer.sh
```

Expected output:
```
Preparing displayplacer v1.4.0...
✓ Copied system displayplacer to resources/
```

Verify the binary exists:
```bash
ls -lh resources/displayplacer
file resources/displayplacer
```

Expected output:
```
-rwxr-xr-x  1 user  staff   XXX KB  date  resources/displayplacer
resources/displayplacer: Mach-O 64-bit executable arm64
```

### 3. Test the Full Build

```bash
# Build the app
npm run build:mac

# Check that displayplacer was bundled
ls -l dist/mac-arm64/Resolutions.app/Contents/Resources/resources/
```

You should see `displayplacer` in the output.

### 4. Test the Built App

```bash
# Install the built DMG
open dist/*.dmg

# Drag to Applications
# Launch the app
# Open the menu - it should work without system displayplacer
```

## CI/CD Testing

The GitHub Actions workflow will automatically:
1. Install displayplacer via Homebrew
2. Run the build script (copies to resources/)
3. Build the DMG with bundled displayplacer
4. Upload artifacts

### Checking CI Build Artifacts

After a successful GitHub Actions run:
1. Go to Actions tab in GitHub
2. Click on the workflow run
3. Download the artifact (DMG)
4. Install and test on a clean macOS system

## Testing Without System displayplacer

To verify the bundled binary works independently:

```bash
# Temporarily hide system displayplacer
sudo mv /usr/local/bin/displayplacer /usr/local/bin/displayplacer.bak
sudo mv /opt/homebrew/bin/displayplacer /opt/homebrew/bin/displayplacer.bak

# Run your built app
open dist/mac-arm64/Resolutions.app

# Restore system displayplacer
sudo mv /usr/local/bin/displayplacer.bak /usr/local/bin/displayplacer
sudo mv /opt/homebrew/bin/displayplacer.bak /opt/homebrew/bin/displayplacer
```

## Expected Behavior

### Development Mode
- App should find displayplacer in this order:
  1. `./resources/displayplacer` (if built)
  2. `/opt/homebrew/bin/displayplacer` (Apple Silicon)
  3. `/usr/local/bin/displayplacer` (Intel)
  4. Result of `which displayplacer`

### Production Build
- App should find bundled displayplacer first
- Fallback to system paths if bundled version missing
- No error messages about displayplacer not being installed

## Troubleshooting Test Failures

### "Resources directory not found"
```bash
mkdir -p resources
```

### "Build script not executable"
```bash
chmod +x scripts/build-displayplacer.sh
```

### "Binary not created after build"
- Ensure you're on macOS (Linux cannot build displayplacer)
- Ensure displayplacer is installed: `brew install displayplacer`
- Check build script output for errors

### "App shows 'displayplacer not installed'"
- Verify binary exists in app bundle: `ls -l Resolutions.app/Contents/Resources/resources/`
- Check file permissions: `ls -l resources/displayplacer`
- Check app logs for path resolution errors

## Success Criteria

✅ All automated tests pass
✅ Build script completes without errors
✅ Binary is created in resources/ directory
✅ Built DMG includes the binary
✅ App works on clean system without Homebrew
✅ App still works with system-installed displayplacer
✅ No errors in console logs

## Reporting Issues

If you encounter any issues, please include:
1. Output of `node scripts/test-bundling.js`
2. Output of `bash scripts/build-displayplacer.sh`
3. macOS version: `sw_vers`
4. Node version: `node --version`
5. Architecture: `uname -m`
6. Whether displayplacer is installed: `which displayplacer`
