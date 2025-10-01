# Quick Start Guide

## First Time Setup

1. **Install Prerequisites:**
   ```bash
   # Install displayplacer (required)
   brew install jakehilborn/jakehilborn/displayplacer
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
Install displayplacer with Homebrew:
```bash
brew install jakehilborn/jakehilborn/displayplacer
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
