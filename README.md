# resolutions

A macOS utility to quickly switch all monitor resolutions from a menu bar app

## Features

- 📺 List all connected monitors in the menu bar
- 🔄 View and switch between available resolutions for each display
- 💾 Save and restore preferred resolutions for each monitor
- 🔁 Auto-refresh when monitors are added, removed, or changed
- ⚡ Quick access from the macOS menu bar (tray)
- 🛡️ Error handling with user-friendly messages

## Prerequisites

- macOS
- Node.js (v14 or higher)
- [displayplacer](https://github.com/jakehilborn/displayplacer) - Install with Homebrew:
  ```bash
  brew install jakehilborn/jakehilborn/displayplacer
  ```

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/jonathanbossenger/resolutions.git
   cd resolutions
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Usage

Start the application:
```bash
npm start
```

For development with logging:
```bash
npm run dev
```

### Using the App

1. Click the menu bar icon to open the display menu
2. Each connected display appears with its name and current resolution
3. Click on a display to see available resolutions
4. Click a resolution to switch to it
5. Use "Save Current as Preferred" to save your preferred resolution for a display
6. Use "Restore Preferred" to quickly switch back to your saved resolution
7. Use "Refresh Displays" to manually refresh the display list

## Architecture

The application is modular with clear separation of concerns:

- **main.js** - Electron application entry point, handles:
  - Tray icon creation and management
  - Menu building and user interactions
  - Display change event listeners
  - Preference storage using electron-store

- **display-helper.js** - Display logic module, handles:
  - Getting display information via displayplacer
  - Parsing display data
  - Setting display resolutions
  - Checking for displayplacer installation

## How It Works

1. The app uses [displayplacer](https://github.com/jakehilborn/displayplacer) to interact with macOS display APIs
2. Display information is fetched and parsed when the menu is opened
3. Resolution changes are applied using displayplacer commands
4. Electron's `screen` API monitors for display changes and auto-refreshes the menu
5. User preferences are stored locally using electron-store

## Development

The codebase follows these principles:
- Modular design with separate concerns
- Async/await for all asynchronous operations
- Comprehensive error handling
- User-friendly error messages

## License

ISC
