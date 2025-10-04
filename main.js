const { app, Tray, Menu, nativeImage, dialog, screen } = require('electron');
const path = require('path');
const Store = require('electron-store');
const displayHelper = require('./display-helper');

const fs = require('fs');

let tray = null;
let store = null;
let isRefreshing = false;

// Initialize the store for saving preferences
function initializeStore() {
  store = new Store({
    name: 'preferences',
    defaults: {
      savedResolutions: {},
      resolutionUsageCount: {},
      launchAtLogin: false
    }
  });
  
  // Sync launch at login setting with system
  const currentSetting = app.getLoginItemSettings().openAtLogin;
  const storedSetting = store.get('launchAtLogin');
  
  // If there's a mismatch, update to match the stored preference
  if (currentSetting !== storedSetting) {
    app.setLoginItemSettings({
      openAtLogin: storedSetting
    });
  }
}

// Get the tray icon path
function getTrayIconPath() {
  // In production (packaged app), assets are in the app's Resources directory
  // In development, they're in the assets directory at the project root
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'assets', 'desktop-alt-light.svg');
  } else {
    return path.join(__dirname, 'assets', 'desktop-alt-light.svg');
  }
}

// Create the tray icon
function createTray() {
  let icon;
  
  try {
    // Try to load the SVG icon file and convert to data URL
    const iconPath = getTrayIconPath();
    if (fs.existsSync(iconPath)) {
      let svgContent = fs.readFileSync(iconPath, 'utf8');
      // Replace white fill with black for template image
      svgContent = svgContent.replace(/fill="#ffffff"/g, 'fill="#000000"');
      const dataUrl = `data:image/svg+xml;base64,${Buffer.from(svgContent).toString('base64')}`;
      icon = nativeImage.createFromDataURL(dataUrl);
      console.log('Loaded tray icon from file:', iconPath);
    } else {
      // Fallback to emoji icon if file not found
      console.log('SVG icon file not found at:', iconPath);
      icon = nativeImage.createFromDataURL(createEmojiIcon('🖥️'));
    }
  } catch (error) {
    // Fallback to emoji icon on error
    console.error('Error loading SVG icon:', error);
    icon = nativeImage.createFromDataURL(createEmojiIcon('🖥️'));
  }
  
  // Mark as template image for proper macOS menu bar rendering
  icon.setTemplateImage(true);
  
  tray = new Tray(icon);
  tray.setToolTip('Resolutions - Monitor Resolution Switcher');
  
  buildMenu();
}

// Create a data URL for an emoji icon
function createEmojiIcon(emoji) {
  // Create a canvas to render the emoji
  const size = 32; // Higher resolution for better quality
  const canvas = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <text x="50%" y="50%" font-size="24" text-anchor="middle" dominant-baseline="central">${emoji}</text>
    </svg>
  `;
  
  return `data:image/svg+xml;base64,${Buffer.from(canvas).toString('base64')}`;
}

// Build the tray menu
async function buildMenu() {
  try {
    const menuTemplate = [];
    
    // Check if displayplacer is installed
    const isInstalled = await displayHelper.checkDisplayPlacerInstalled();
    
    if (!isInstalled) {
      menuTemplate.push({
        label: '⚠️ displayplacer not installed',
        enabled: false
      });
      menuTemplate.push({
        label: 'Install with: brew install displayplacer',
        enabled: false
      });
      menuTemplate.push({
        label: 'Get Homebrew at: https://brew.sh/',
        enabled: false
      });
      menuTemplate.push({ type: 'separator' });
      menuTemplate.push({
        label: 'Launch at Login',
        type: 'checkbox',
        checked: store.get('launchAtLogin'),
        click: () => toggleLaunchAtLogin()
      });
      menuTemplate.push({
        label: 'Quit',
        click: () => app.quit()
      });
      
      const menu = Menu.buildFromTemplate(menuTemplate);
      tray.setContextMenu(menu);
      return;
    }
    
    // Get all displays
    const displays = await displayHelper.getDisplays();
    
    if (displays.length === 0) {
      menuTemplate.push({
        label: 'No displays found',
        enabled: false
      });
    } else {
      // Add each display as a submenu
      displays.forEach((display, index) => {
        const displayName = display.name || `Display ${index + 1}`;
        const currentRes = display.currentResolution || 'Unknown';
        
        // Get most used resolutions for this display
        const mostUsedResolutions = getMostUsedResolutions(display.persistentId, 5);
        
        // Create resolution items
        const createResolutionItem = (resolution) => ({
          label: resolution,
          type: 'radio',
          checked: resolution === currentRes,
          click: () => changeResolution(display.persistentId, resolution)
        });
        
        // Separate most used from other resolutions
        const mostUsedItems = mostUsedResolutions
          .filter(res => display.resolutions.includes(res))
          .map(createResolutionItem);
        
        const otherResolutions = display.resolutions.filter(
          res => !mostUsedResolutions.includes(res)
        );
        const otherResolutionItems = otherResolutions.map(createResolutionItem);
        
        // Add save/restore options
        const savedResolution = store.get(`savedResolutions.${display.persistentId}`);
        const submenuItems = [
          {
            label: `Current: ${currentRes}`,
            enabled: false
          },
          { type: 'separator' }
        ];
        
        // Add most used resolutions section if there are any
        if (mostUsedItems.length > 0) {
          submenuItems.push({
            label: 'Most Used Resolutions',
            enabled: false
          });
          submenuItems.push(...mostUsedItems);
          submenuItems.push({ type: 'separator' });
        }
        
        // Add other available resolutions
        if (otherResolutionItems.length > 0) {
          submenuItems.push({
            label: 'Available Resolutions',
            enabled: false
          });
          submenuItems.push(...otherResolutionItems);
          submenuItems.push({ type: 'separator' });
        }
        
        submenuItems.push({
          label: 'Save Current as Preferred',
          click: () => savePreferredResolution(display.persistentId, currentRes)
        });
        
        if (savedResolution) {
          submenuItems.push({
            label: `Restore Preferred (${savedResolution})`,
            click: () => restorePreferredResolution(display.persistentId)
          });
        }
        
        menuTemplate.push({
          label: `📺 ${displayName}`,
          submenu: submenuItems
        });
      });
    }
    
    // Add separator and utility options
    menuTemplate.push({ type: 'separator' });
    menuTemplate.push({
      label: '🔄 Refresh Displays',
      click: () => refreshMenu()
    });
    menuTemplate.push({ type: 'separator' });
    menuTemplate.push({
      label: 'Launch at Login',
      type: 'checkbox',
      checked: store.get('launchAtLogin'),
      click: () => toggleLaunchAtLogin()
    });
    menuTemplate.push({
      label: 'Quit',
      click: () => app.quit()
    });
    
    const menu = Menu.buildFromTemplate(menuTemplate);
    tray.setContextMenu(menu);
    
  } catch (error) {
    console.error('Error building menu:', error);
    
    const errorMenu = Menu.buildFromTemplate([
      {
        label: `Error: ${error.message}`,
        enabled: false
      },
      { type: 'separator' },
      {
        label: 'Retry',
        click: () => refreshMenu()
      },
      { type: 'separator' },
      {
        label: 'Launch at Login',
        type: 'checkbox',
        checked: store.get('launchAtLogin'),
        click: () => toggleLaunchAtLogin()
      },
      {
        label: 'Quit',
        click: () => app.quit()
      }
    ]);
    
    tray.setContextMenu(errorMenu);
  }
}

// Change resolution for a display
async function changeResolution(persistentId, resolution) {
  try {
    await displayHelper.setDisplayResolution(persistentId, resolution);
    
    // Track resolution usage
    trackResolutionUsage(persistentId, resolution);
    
    // Refresh menu after a short delay to reflect the change
    setTimeout(() => refreshMenu(), 1000);
    
  } catch (error) {
    console.error('Error changing resolution:', error);
    dialog.showErrorBox(
      'Resolution Change Failed',
      `Failed to change resolution: ${error.message}`
    );
  }
}

// Track resolution usage for a display
function trackResolutionUsage(persistentId, resolution) {
  try {
    const usageCounts = store.get('resolutionUsageCount') || {};
    
    // Initialize display usage if it doesn't exist
    if (!usageCounts[persistentId]) {
      usageCounts[persistentId] = {};
    }
    
    // Increment usage count for this resolution
    if (!usageCounts[persistentId][resolution]) {
      usageCounts[persistentId][resolution] = 0;
    }
    usageCounts[persistentId][resolution]++;
    
    store.set('resolutionUsageCount', usageCounts);
    console.log(`Tracked resolution usage: ${persistentId} - ${resolution} (count: ${usageCounts[persistentId][resolution]})`);
    
  } catch (error) {
    console.error('Error tracking resolution usage:', error);
    // Don't show error dialog for tracking failures, just log it
  }
}

// Get most used resolutions for a display
function getMostUsedResolutions(persistentId, limit = 5) {
  try {
    const usageCounts = store.get('resolutionUsageCount') || {};
    const displayUsage = usageCounts[persistentId] || {};
    
    // Convert to array and sort by usage count (descending)
    const sortedResolutions = Object.entries(displayUsage)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(entry => entry[0]);
    
    return sortedResolutions;
  } catch (error) {
    console.error('Error getting most used resolutions:', error);
    return [];
  }
}

// Save preferred resolution for a display
function savePreferredResolution(persistentId, resolution) {
  try {
    const savedResolutions = store.get('savedResolutions');
    savedResolutions[persistentId] = resolution;
    store.set('savedResolutions', savedResolutions);
    
    console.log(`Saved preferred resolution for ${persistentId}: ${resolution}`);
    
    // Refresh menu to show the new preferred resolution
    refreshMenu();
    
  } catch (error) {
    console.error('Error saving preferred resolution:', error);
    dialog.showErrorBox(
      'Save Failed',
      `Failed to save preferred resolution: ${error.message}`
    );
  }
}

// Restore preferred resolution for a display
async function restorePreferredResolution(persistentId) {
  try {
    const savedResolution = store.get(`savedResolutions.${persistentId}`);
    
    if (savedResolution) {
      await changeResolution(persistentId, savedResolution);
    }
    
  } catch (error) {
    console.error('Error restoring preferred resolution:', error);
    dialog.showErrorBox(
      'Restore Failed',
      `Failed to restore preferred resolution: ${error.message}`
    );
  }
}

// Toggle launch at login
function toggleLaunchAtLogin() {
  try {
    const currentValue = store.get('launchAtLogin');
    const newValue = !currentValue;
    
    // Update the system setting
    app.setLoginItemSettings({
      openAtLogin: newValue
    });
    
    // Store the preference
    store.set('launchAtLogin', newValue);
    
    console.log(`Launch at login ${newValue ? 'enabled' : 'disabled'}`);
    
    // Refresh menu to update checkbox
    refreshMenu();
    
  } catch (error) {
    console.error('Error toggling launch at login:', error);
    dialog.showErrorBox(
      'Settings Error',
      `Failed to update launch at login setting: ${error.message}`
    );
  }
}

// Refresh the menu
async function refreshMenu() {
  if (isRefreshing) {
    return;
  }
  
  isRefreshing = true;
  try {
    await buildMenu();
  } finally {
    isRefreshing = false;
  }
}

// Listen for display changes
function setupDisplayChangeListener() {
  screen.on('display-added', () => {
    console.log('Display added');
    setTimeout(() => refreshMenu(), 500);
  });
  
  screen.on('display-removed', () => {
    console.log('Display removed');
    setTimeout(() => refreshMenu(), 500);
  });
  
  screen.on('display-metrics-changed', () => {
    console.log('Display metrics changed');
    setTimeout(() => refreshMenu(), 500);
  });
}

// App lifecycle
app.whenReady().then(() => {
  initializeStore();
  createTray();
  setupDisplayChangeListener();
});

// Prevent app from quitting when all windows are closed (menu bar app behavior)
app.on('window-all-closed', (e) => {
  e.preventDefault();
});

// Handle app activation (macOS specific)
app.on('activate', () => {
  // Menu bar apps don't typically do anything on activate
});

// Clean up on quit
app.on('before-quit', () => {
  if (tray) {
    tray.destroy();
  }
});
