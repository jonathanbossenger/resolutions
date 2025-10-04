# Quick Start Guide

## First Time Setup

### Using Pre-built Installers (Recommended)

1. **Download the Installer:**
   - Go to the [latest release](https://github.com/jonathanbossenger/resolutions/releases/latest)
   - Download the appropriate `.dmg` file for your Mac:
     - `Resolutions-*-arm64.dmg` for Apple Silicon Macs (M1, M2, M3, etc.)
     - `Resolutions-*-x64.dmg` for Intel Macs

2. **Install the Application:**
   - Open the downloaded `.dmg` file
   - Drag the Resolutions app to your Applications folder
   - Launch the app from Applications

The app comes with displayplacer bundled, so no additional installation is required!

### Building from Source

1. **Install Prerequisites:**
   ```bash
   # Install Homebrew (if not already installed): https://brew.sh/
   # Install displayplacer (required for development)
   brew install displayplacer
   ```

2. **Install the Application:**
   ```bash
   git clone https://github.com/jonathanbossenger/resolutions.git
   cd resolutions
   npm install
   ```

3. **Run the Application:**
   ```bash
   npm start
   ```

## First Time Use

When you first run the app, you'll see a new icon in your macOS menu bar. Click it to see:

1. **Your Displays:** Each connected monitor is listed with its name
2. **Current Resolution:** Shown at the top of each display's submenu
3. **Available Resolutions:** All possible resolutions for that display
4. **Refresh Option:** Manually refresh the display list if needed

## Common Tasks

### Change a Display's Resolution
1. Click the menu bar icon
2. Click on the display you want to change
3. Click on the desired resolution from the list
4. The resolution will change immediately

### Save Your Preferred Resolution
1. Set your display to the resolution you prefer
2. Click the menu bar icon
3. Click on the display
4. Click "Save Current as Preferred"

### Restore Your Preferred Resolution
1. Click the menu bar icon
2. Click on the display
3. Click "Restore Preferred (resolution)" - this option only appears if you've saved a preference

## Troubleshooting

### "displayplacer not installed" message
If you're using the pre-built installer, this shouldn't happen as displayplacer is bundled with the app. If you see this message:
- Make sure you're using the official installer from the releases page
- Try reinstalling the app
- If developing from source, install displayplacer with Homebrew:
  ```bash
  brew install displayplacer
  ```

### Menu doesn't update when I connect/disconnect displays
The menu should auto-refresh, but you can manually refresh by:
1. Click the menu bar icon
2. Click "🔄 Refresh Displays"

### Resolution change failed
- Ensure the selected resolution is supported by your monitor
- Check that displayplacer is installed correctly
- Try manually with: `displayplacer list` to see if it works

## Tips

- The app auto-detects when displays are added, removed, or changed
- Preferences are saved in `~/Library/Application Support/resolutions/preferences.json`
- You can have different preferred resolutions for different displays
- The current resolution is marked with a radio button (•) in the menu

## Quitting the App

Click the menu bar icon and select "Quit"

## Getting Help

- Check the [README.md](README.md) for detailed information
- See [CONTRIBUTING.md](CONTRIBUTING.md) for development details
- File an issue on GitHub if you encounter problems
