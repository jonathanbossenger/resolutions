const { exec } = require('child_process');
const util = require('util');
const fs = require('fs');

const execPromise = util.promisify(exec);

// Cache for displayplacer path
let displayPlacerPath = null;

/**
 * Find the full path to displayplacer executable
 * Checks common Homebrew installation locations
 * @returns {Promise<string|null>} Full path to displayplacer or null if not found
 */
async function findDisplayPlacerPath() {
  // Return cached path if available
  if (displayPlacerPath) {
    return displayPlacerPath;
  }

  // Common Homebrew installation paths
  const possiblePaths = [
    '/opt/homebrew/bin/displayplacer',  // Apple Silicon
    '/usr/local/bin/displayplacer',      // Intel
  ];

  // Check each possible path
  for (const path of possiblePaths) {
    try {
      // Use fs.access to check if file exists and is executable
      await fs.promises.access(path, fs.constants.X_OK);
      displayPlacerPath = path;
      return path;
    } catch (error) {
      // File doesn't exist or isn't executable, try next path
      continue;
    }
  }

  // If not found in common paths, try using 'which' as fallback
  // This will work in development environments
  try {
    const { stdout } = await execPromise('which displayplacer');
    const path = stdout.trim();
    if (path) {
      displayPlacerPath = path;
      return path;
    }
  } catch (error) {
    // 'which' command failed
  }

  return null;
}

/**
 * Get all connected displays with their available resolutions
 * Uses displayplacer to get display information
 * @returns {Promise<Array>} Array of display objects with id, name, and resolutions
 */
async function getDisplays() {
  try {
    const displayPlacerPath = await findDisplayPlacerPath();
    if (!displayPlacerPath) {
      throw new Error('displayplacer not found');
    }
    const { stdout } = await execPromise(`${displayPlacerPath} list`);
    const displays = parseDisplayPlacerOutput(stdout);
    return displays;
  } catch (error) {
    console.error('Error getting displays:', error);
    throw new Error(`Failed to get displays: ${error.message}`);
  }
}

/**
 * Parse displayplacer output to extract display information
 * @param {string} output - The raw output from displayplacer list
 * @returns {Array} Array of display objects
 */
function parseDisplayPlacerOutput(output) {
  const displays = [];
  const lines = output.split('\n');
  
  let currentDisplay = null;
  let resolutionsSection = false;
  
  for (const line of lines) {
    // Match display ID and persistent ID
    const displayMatch = line.match(/Persistent screen id:\s*([A-Fa-f0-9-]+)/);
    if (displayMatch) {
      if (currentDisplay) {
        displays.push(currentDisplay);
      }
      currentDisplay = {
        persistentId: displayMatch[1],
        name: 'Unknown',
        currentResolution: null,
        resolutions: []
      };
      resolutionsSection = false;
      continue;
    }
    
    // Get current resolution
    const currentResMatch = line.match(/Resolution:\s*(\d+)x(\d+)/i);
    if (currentResMatch && currentDisplay) {
      currentDisplay.currentResolution = `${currentResMatch[1]}x${currentResMatch[2]}`;
    }
    
    // Get display name/type
    const typeMatch = line.match(/Type:\s*(.+)/i);
    if (typeMatch && currentDisplay) {
      currentDisplay.name = typeMatch[1].trim();
    }
    
    // Check if we're in the resolutions section
    if (line.includes('Resolutions for rotation')) {
      resolutionsSection = true;
      continue;
    }
    
    // Parse available resolutions
    if (resolutionsSection && currentDisplay && line.trim()) {
      const resMatch = line.match(/(\d+)x(\d+)/);
      if (resMatch) {
        const resolution = `${resMatch[1]}x${resMatch[2]}`;
        if (!currentDisplay.resolutions.includes(resolution)) {
          currentDisplay.resolutions.push(resolution);
        }
      }
    }
  }
  
  // Add the last display
  if (currentDisplay) {
    displays.push(currentDisplay);
  }
  
  return displays;
}

/**
 * Set resolution for a specific display
 * @param {string} persistentId - The persistent ID of the display
 * @param {string} resolution - The resolution to set (e.g., "1920x1080")
 * @returns {Promise<void>}
 */
async function setDisplayResolution(persistentId, resolution) {
  try {
    const displayPlacerPath = await findDisplayPlacerPath();
    if (!displayPlacerPath) {
      throw new Error('displayplacer not found');
    }

    const [width, height] = resolution.split('x');
    
    // Get current display configuration to preserve other settings
    const { stdout } = await execPromise(`${displayPlacerPath} list`);
    const currentConfig = extractDisplayPlacerConfig(stdout, persistentId);
    
    // Build the displayplacer command with new resolution
    const command = buildDisplayPlacerCommand(currentConfig, width, height, displayPlacerPath);
    
    await execPromise(command);
    console.log(`Successfully set display ${persistentId} to ${resolution}`);
  } catch (error) {
    console.error('Error setting display resolution:', error);
    throw new Error(`Failed to set resolution: ${error.message}`);
  }
}

/**
 * Extract current displayplacer configuration for a specific display
 * @param {string} output - The raw output from displayplacer list
 * @param {string} persistentId - The persistent ID of the display
 * @returns {Object} Configuration object
 */
function extractDisplayPlacerConfig(output, persistentId) {
  const lines = output.split('\n');
  const config = {
    id: persistentId,
    width: null,
    height: null,
    scaling: 'on',
    origin: '(0,0)',
    degree: '0'
  };
  
  let inTargetDisplay = false;
  
  for (const line of lines) {
    if (line.includes(persistentId)) {
      inTargetDisplay = true;
    }
    
    if (inTargetDisplay) {
      const resMatch = line.match(/Resolution:\s*(\d+)x(\d+)/i);
      if (resMatch) {
        config.width = resMatch[1];
        config.height = resMatch[2];
      }
      
      const scalingMatch = line.match(/Scaling:\s*(on|off)/i);
      if (scalingMatch) {
        config.scaling = scalingMatch[1].toLowerCase();
      }
      
      const originMatch = line.match(/Origin:\s*\(([^)]+)\)/i);
      if (originMatch) {
        config.origin = `(${originMatch[1]})`;
      }
      
      const degreeMatch = line.match(/Degree:\s*(\d+)/i);
      if (degreeMatch) {
        config.degree = degreeMatch[1];
      }
      
      // Stop after finding all config for this display
      if (line.includes('Resolutions for rotation')) {
        break;
      }
    }
  }
  
  return config;
}

/**
 * Build displayplacer command to set resolution
 * @param {Object} config - Display configuration
 * @param {string} newWidth - New width
 * @param {string} newHeight - New height
 * @returns {string} The displayplacer command
 */
function isValidId(id) {
  // Persistent IDs are typically alphanumeric and dashes
  return typeof id === 'string' && /^[a-zA-Z0-9\-]+$/.test(id);
}

function isValidResolution(value) {
  // Width and height should be positive integers
  return typeof value === 'string' && /^\d+$/.test(value);
}

function isValidScaling(scaling) {
  // Only 'on' or 'off' allowed
  return scaling === 'on' || scaling === 'off';
}

function isValidOrigin(origin) {
  // Origin should be in format (number,number)
  return typeof origin === 'string' && /^\(\d+,\d+\)$/.test(origin);
}

function isValidDegree(degree) {
  // Degree should be 0, 90, 180, or 270
  return typeof degree === 'string' && /^(0|90|180|270)$/.test(degree);
}

function buildDisplayPlacerCommand(config, newWidth, newHeight, displayPlacerPath) {
  if (
    !isValidId(config.id) ||
    !isValidResolution(newWidth) ||
    !isValidResolution(newHeight) ||
    !isValidScaling(config.scaling) ||
    !isValidOrigin(config.origin) ||
    !isValidDegree(config.degree)
  ) {
    throw new Error('Invalid display configuration values');
  }
  return `${displayPlacerPath} "id:${config.id} res:${newWidth}x${newHeight} scaling:${config.scaling} origin:${config.origin} degree:${config.degree}"`;
}

/**
 * Check if displayplacer is installed
 * @returns {Promise<boolean>} True if displayplacer is installed
 */
async function checkDisplayPlacerInstalled() {
  try {
    const path = await findDisplayPlacerPath();
    return path !== null;
  } catch (error) {
    return false;
  }
}

module.exports = {
  getDisplays,
  setDisplayResolution,
  checkDisplayPlacerInstalled
};
