# Example Preferences

This file shows an example of what the preferences.json file looks like after you save preferred resolutions.

The app stores preferences in the following location:
- macOS: `~/Library/Application Support/resolutions/preferences.json`

## Example preferences.json content:

```json
{
  "savedResolutions": {
    "37D8832A-2D66-02CA-B9F7-8F30A301B230": "2560x1440",
    "A1B2C3D4-5E6F-7A8B-9C0D-1E2F3A4B5C6D": "1920x1080"
  }
}
```

Where:
- The keys are persistent display IDs (assigned by macOS)
- The values are your preferred resolutions for each display

You can edit this file manually if needed, but it's recommended to use the "Save Current as Preferred" option in the app menu.
