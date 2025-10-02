# Contributing to Resolutions

Thank you for your interest in contributing to Resolutions!

## Development Setup

1. Ensure you have Node.js (v14+) installed
2. Install [Homebrew](https://brew.sh/) (if not already installed)
3. Install displayplacer: `brew install displayplacer`
4. Clone the repository and install dependencies:
   ```bash
   git clone https://github.com/jonathanbossenger/resolutions.git
   cd resolutions
   npm install
   ```

## Code Structure

### main.js
- Electron application entry point
- Handles tray icon creation and menu management
- Manages user interactions
- Listens for display change events
- Stores user preferences using electron-store

### display-helper.js
- Modular helper for display-related operations
- Interfaces with displayplacer CLI tool
- Parses display information
- Handles resolution switching

## Development Workflow

1. Make changes to the code
2. Test with `npm run dev` (includes logging)
3. Ensure code follows existing patterns
4. Test error handling by disconnecting/connecting displays
5. Verify preferences are saved correctly

## Testing

Since this is a macOS-specific app that requires real display hardware:
- Manual testing is required
- Test with multiple monitors if possible
- Test with different resolution configurations
- Test saving and restoring preferences
- Test error scenarios (displayplacer not installed, etc.)

## Code Style

- Use async/await for asynchronous operations
- Add descriptive comments for complex logic
- Handle errors gracefully with user-friendly messages
- Keep functions modular and single-purpose
- Follow existing code formatting

## Submitting Changes

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request with a clear description

## Ideas for Future Enhancements

- Add keyboard shortcuts for quick resolution switching
- Support for color profiles
- Support for refresh rate selection
- Built-in displayplacer installation check/helper
- Remember and auto-apply resolutions per display configuration
- Support for creating resolution profiles/presets
