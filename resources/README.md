# Resources Directory

This directory contains bundled resources for the Resolutions application.

## displayplacer Binary

The `displayplacer` binary is bundled with the app to eliminate the need for users to manually install it via Homebrew.

### How It Works

1. **Development**: When developing locally, run `npm install` to install dependencies. If you have displayplacer installed via Homebrew, it will be used. Otherwise, install it with `brew install displayplacer`.

2. **Building**: During the build process (`npm run build:mac`), the build script (`scripts/build-displayplacer.sh`) automatically:
   - Checks if displayplacer is installed on the system
   - Copies the binary to this `resources/` directory
   - The Electron builder then includes it in the app bundle

3. **Runtime**: The app's `display-helper.js` module automatically:
   - First checks for the bundled displayplacer binary
   - Falls back to system-installed versions if not found
   - Works seamlessly in both development and production

### License

The bundled displayplacer is from: https://github.com/jakehilborn/displayplacer
License: MIT (See the displayplacer repository for full license text)

### Updating displayplacer

To update to a newer version of displayplacer:
1. Update the `DISPLAYPLACER_VERSION` in `scripts/build-displayplacer.sh`
2. Run the build script manually or let it run during the build process
