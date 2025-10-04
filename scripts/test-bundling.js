#!/usr/bin/env node

/**
 * Simple test to verify the displayplacer bundling logic
 * This tests the path resolution without requiring a full Electron environment
 */

const path = require('path');
const fs = require('fs');

console.log('Testing displayplacer path resolution logic...\n');

// Test 1: Verify resources directory exists
console.log('Test 1: Check resources directory');
const resourcesDir = path.join(__dirname, '..', 'resources');
try {
  const stats = fs.statSync(resourcesDir);
  if (stats.isDirectory()) {
    console.log('✓ Resources directory exists:', resourcesDir);
  } else {
    console.log('✗ Resources path exists but is not a directory');
    process.exit(1);
  }
} catch (error) {
  console.log('✗ Resources directory not found');
  process.exit(1);
}

// Test 2: Verify build script exists and is executable
console.log('\nTest 2: Check build script');
const buildScript = path.join(__dirname, '..', 'scripts', 'build-displayplacer.sh');
try {
  const stats = fs.statSync(buildScript);
  if (stats.isFile()) {
    console.log('✓ Build script exists:', buildScript);
    
    // Check if executable
    try {
      fs.accessSync(buildScript, fs.constants.X_OK);
      console.log('✓ Build script is executable');
    } catch (error) {
      console.log('⚠ Build script exists but is not executable (might need: chmod +x)');
    }
  } else {
    console.log('✗ Build script path exists but is not a file');
    process.exit(1);
  }
} catch (error) {
  console.log('✗ Build script not found');
  process.exit(1);
}

// Test 3: Verify package.json has correct configuration
console.log('\nTest 3: Check package.json configuration');
const packageJson = require('../package.json');

// Check prebuild script
if (packageJson.scripts && packageJson.scripts.prebuild) {
  console.log('✓ prebuild script defined:', packageJson.scripts.prebuild);
} else {
  console.log('✗ prebuild script not found in package.json');
  process.exit(1);
}

// Check extraResources configuration
if (packageJson.build && packageJson.build.extraResources) {
  console.log('✓ extraResources configuration found');
  const resourcesConfig = packageJson.build.extraResources.find(
    r => r.from === 'resources'
  );
  if (resourcesConfig) {
    console.log('✓ Resources directory configured for bundling');
  } else {
    console.log('✗ Resources directory not configured in extraResources');
    process.exit(1);
  }
} else {
  console.log('✗ extraResources not found in package.json');
  process.exit(1);
}

// Test 4: Verify display-helper.js imports
console.log('\nTest 4: Check display-helper.js structure');
try {
  const displayHelperPath = path.join(__dirname, '..', 'display-helper.js');
  const content = fs.readFileSync(displayHelperPath, 'utf8');
  
  // Check for required imports
  if (content.includes('const path = require') && content.includes('const { app } = require')) {
    console.log('✓ display-helper.js has required imports');
  } else {
    console.log('✗ display-helper.js missing required imports');
    process.exit(1);
  }
  
  // Check for bundled path function
  if (content.includes('getBundledDisplayPlacerPath')) {
    console.log('✓ getBundledDisplayPlacerPath function exists');
  } else {
    console.log('✗ getBundledDisplayPlacerPath function not found');
    process.exit(1);
  }
  
  // Check for process.resourcesPath usage
  if (content.includes('process.resourcesPath')) {
    console.log('✓ Uses process.resourcesPath for packaged apps');
  } else {
    console.log('⚠ Does not use process.resourcesPath (might not work in production)');
  }
  
} catch (error) {
  console.log('✗ Error reading display-helper.js:', error.message);
  process.exit(1);
}

// Test 5: Verify .gitignore excludes the binary
console.log('\nTest 5: Check .gitignore');
try {
  const gitignorePath = path.join(__dirname, '..', '.gitignore');
  const content = fs.readFileSync(gitignorePath, 'utf8');
  
  if (content.includes('resources/displayplacer')) {
    console.log('✓ .gitignore excludes resources/displayplacer');
  } else {
    console.log('⚠ .gitignore does not explicitly exclude resources/displayplacer');
  }
} catch (error) {
  console.log('⚠ Could not read .gitignore');
}

console.log('\n✅ All tests passed!');
console.log('\nNote: Full functionality can only be tested in a macOS environment with Electron.');
