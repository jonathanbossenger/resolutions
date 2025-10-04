#!/bin/bash

# Script to prepare displayplacer for bundling with the app
# On macOS with Xcode: builds from source
# On other systems: provides instructions for manual placement

set -e

DISPLAYPLACER_VERSION="1.4.0"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
RESOURCES_DIR="$PROJECT_ROOT/resources"
BUILD_DIR="/tmp/displayplacer-build"

echo "Preparing displayplacer v$DISPLAYPLACER_VERSION..."

# Create resources directory if it doesn't exist
mkdir -p "$RESOURCES_DIR"

# Check if we're on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo "⚠️  Not on macOS - displayplacer can only be built on macOS"
    echo "   The bundled binary will be built during the macOS CI/CD process"
    exit 0
fi

# Check if displayplacer binary already exists
if [ -f "$RESOURCES_DIR/displayplacer" ]; then
    echo "✓ displayplacer binary already exists in resources/"
    file "$RESOURCES_DIR/displayplacer"
    exit 0
fi

# Try to copy from system if already installed via Homebrew
if command -v displayplacer &> /dev/null; then
    SYSTEM_PATH=$(which displayplacer)
    echo "Found system displayplacer at: $SYSTEM_PATH"
    cp "$SYSTEM_PATH" "$RESOURCES_DIR/displayplacer"
    chmod +x "$RESOURCES_DIR/displayplacer"
    echo "✓ Copied system displayplacer to resources/"
    file "$RESOURCES_DIR/displayplacer"
    exit 0
fi

# If not installed, try to build from source
echo "displayplacer not found in system, building from source..."

# Clean up any previous build
rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR"

# Download displayplacer source
echo "Downloading displayplacer source..."
cd "$BUILD_DIR"
curl -L "https://github.com/jakehilborn/displayplacer/archive/refs/tags/v${DISPLAYPLACER_VERSION}.tar.gz" -o displayplacer.tar.gz
tar -xzf displayplacer.tar.gz
cd "displayplacer-${DISPLAYPLACER_VERSION}"

# Build displayplacer
echo "Building displayplacer..."
cd src
make

# Verify the binary was built
if [ ! -f displayplacer ]; then
    echo "Error: displayplacer binary was not built"
    exit 1
fi

# Copy the binary to resources
echo "Copying binary to resources directory..."
cp displayplacer "$RESOURCES_DIR/displayplacer"
chmod +x "$RESOURCES_DIR/displayplacer"

# Clean up build directory
cd "$PROJECT_ROOT"
rm -rf "$BUILD_DIR"

echo "✓ displayplacer binary built and copied to resources/"
echo "  Binary location: $RESOURCES_DIR/displayplacer"

# Show binary info
file "$RESOURCES_DIR/displayplacer"
