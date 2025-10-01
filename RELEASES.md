# Release Process

This document describes how releases are created for the Resolutions app.

## Overview

The project uses GitHub Actions to automatically build installers for both Apple Silicon (arm64) and Intel (x64) Mac platforms. The workflow creates both DMG disk images and ZIP archives for easy distribution.

## Creating a Release

### 1. Prepare the Release

Ensure all changes are committed and the app is working correctly:

```bash
npm start  # Test the app
```

### 2. Update Version (Optional)

Update the version in `package.json` if needed:

```json
{
  "version": "1.0.0"
}
```

### 3. Create and Push a Tag

Create a version tag and push it to GitHub:

```bash
git tag v1.0.0
git push origin v1.0.0
```

The tag name should follow semantic versioning (e.g., v1.0.0, v1.2.3).

### 4. Wait for the Build

The GitHub Actions workflow will automatically:
1. Detect the new tag
2. Build installers for both architectures
3. Create a GitHub release
4. Attach all installers to the release

You can monitor the progress in the "Actions" tab of the repository.

### 5. Download and Test

Once the workflow completes, you can:
- Download the installers from the GitHub release page
- Test each installer on the appropriate Mac platform
- Update the release notes if needed

## Manual Build Trigger

You can also trigger the build workflow manually without creating a tag:

1. Go to the "Actions" tab in GitHub
2. Select the "Build Release" workflow
3. Click "Run workflow"
4. Choose the branch and click "Run workflow"

The artifacts will be available for download from the workflow run, but won't create a GitHub release.

## Build Outputs

Each workflow run produces the following artifacts:

### For Apple Silicon (arm64):
- `Resolutions-{version}-arm64.dmg` - DMG installer
- `Resolutions-{version}-arm64-mac.zip` - ZIP archive

### For Intel (x64):
- `Resolutions-{version}.dmg` - DMG installer  
- `Resolutions-{version}-mac.zip` - ZIP archive

## Installation Instructions for Users

### Apple Silicon Macs (M1, M2, M3, etc.):
1. Download the `*-arm64.dmg` file
2. Open the DMG file
3. Drag Resolutions to the Applications folder
4. Install displayplacer: `brew install jakehilborn/jakehilborn/displayplacer`

### Intel Macs:
1. Download the `*-x64.dmg` or regular `.dmg` file
2. Open the DMG file
3. Drag Resolutions to the Applications folder
4. Install displayplacer: `brew install jakehilborn/jakehilborn/displayplacer`

## Troubleshooting

### Build Fails
- Check the Actions tab for error messages
- Ensure all dependencies are properly listed in package.json
- Verify the workflow YAML syntax is correct

### Wrong Architecture Built
- The workflow uses a matrix strategy to build both architectures
- Check that both jobs completed successfully in the Actions tab

### Release Not Created
- Ensure you pushed a tag starting with 'v' (e.g., v1.0.0)
- Check that the workflow has permissions to create releases
- Verify GITHUB_TOKEN has the necessary permissions
