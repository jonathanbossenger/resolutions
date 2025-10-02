# Example Preferences

This file shows an example of what the preferences.json file looks like after you save preferred resolutions and use the app to switch resolutions.

The app stores preferences in the following location:
- macOS: `~/Library/Application Support/resolutions/preferences.json`

## Example preferences.json content:

```json
{
  "savedResolutions": {
    "37D8832A-2D66-02CA-B9F7-8F30A301B230": "2560x1440",
    "A1B2C3D4-5E6F-7A8B-9C0D-1E2F3A4B5C6D": "1920x1080"
  },
  "resolutionUsageCount": {
    "37D8832A-2D66-02CA-B9F7-8F30A301B230": {
      "2560x1440": 15,
      "1920x1080": 8,
      "3840x2160": 3
    },
    "A1B2C3D4-5E6F-7A8B-9C0D-1E2F3A4B5C6D": {
      "1920x1080": 22,
      "1680x1050": 10,
      "1280x720": 2
    }
  }
}
```

Where:
- `savedResolutions`: The keys are persistent display IDs (assigned by macOS), and the values are your preferred resolutions for each display
- `resolutionUsageCount`: Tracks how many times each resolution has been selected for each display. The app uses this to show your most frequently used resolutions at the top of the menu.

## Most Used Resolutions Feature

The app automatically tracks every resolution change you make. Your most frequently used resolutions (up to 5) will appear in a "Most Used Resolutions" section at the top of each display's menu for quick access. These resolutions are removed from the "Available Resolutions" list to avoid duplication.

You can edit this file manually if needed, but it's recommended to use the app menu for managing preferences.
