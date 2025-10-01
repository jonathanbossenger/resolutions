const { app, Tray, Menu, nativeImage, dialog, screen } = require('electron');
const path = require('path');
const Store = require('electron-store');
const displayHelper = require('./display-helper');

let tray = null;
let store = null;
let isRefreshing = false;

// Initialize the store for saving preferences
function initializeStore() {
  store = new Store({
    name: 'preferences',
    defaults: {
      savedResolutions: {}
    }
  });
}

// Create the tray icon
function createTray() {
  // Create a simple 16x16 icon for the menu bar
  // Using a basic monitor/display icon that will be visible
  let icon;
  
  try {
    // Try to create from data URL first
    icon = nativeImage.createFromDataURL(
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAAEKSURBVHjarJKxSwJhGMZ/996dioYgDUFDNLREU0M0RFtTRPQPNEVDRH9BU0NDUEQ0RLRE0RBBQzRFQwQN0RQN0VDQ0lBQ3+fwfXKneZYP3vLyvM/7vO/7ymazPCMAPAH8/0EEgHvgFrgCzoEY0A20At1AK9ACNAMBwAs4AAfg/AvABrAKbAObwAqwBswD08AkMAaMAMNAP9APeIAyoAQoAgqBAqAAyP8fQAG8wBWQAM6AI+AQ2Ad2gR1gG9gCNoAEEP8XYBCYAcaBUWAYGAL6gB6gE2gHWoAmoB7wWAB1QC1QDVQClUAF4AeKgUIgDygAXEAO4ASygWwgC8gEMgA78P4gAF+2m7xrhH15AAAAAElFTkSuQmCC'
    );
    
    // Mark as template image for proper macOS menu bar rendering
    if (icon && !icon.isEmpty()) {
      icon.setTemplateImage(true);
    }
  } catch (error) {
    console.error('Error creating icon from data URL:', error);
  }
  
  // Fallback: create a simple icon from buffer if the above failed
  if (!icon || icon.isEmpty()) {
    // Create a minimal 16x16 black and white icon
    const iconSize = 16;
    const pixels = Buffer.alloc(iconSize * iconSize * 4);
    
    // Draw a simple rectangle (monitor shape)
    for (let y = 4; y < 12; y++) {
      for (let x = 2; x < 14; x++) {
        const idx = (y * iconSize + x) * 4;
        // Set to black (template mode will handle the color)
        pixels[idx] = 0;     // R
        pixels[idx + 1] = 0; // G
        pixels[idx + 2] = 0; // B
        pixels[idx + 3] = 255; // A (fully opaque)
      }
    }
    
    icon = nativeImage.createFromBuffer(pixels, {
      width: iconSize,
      height: iconSize
    });
    icon.setTemplateImage(true);
  }
  
  tray = new Tray(icon);
  tray.setToolTip('Resolutions - Monitor Resolution Switcher');
  
  buildMenu();
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
        label: 'Install with: brew install jakehilborn/jakehilborn/displayplacer',
        enabled: false
      });
      menuTemplate.push({ type: 'separator' });
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
        
        const resolutionItems = display.resolutions.map(resolution => ({
          label: resolution,
          type: 'radio',
          checked: resolution === currentRes,
          click: () => changeResolution(display.persistentId, resolution)
        }));
        
        // Add save/restore options
        const savedResolution = store.get(`savedResolutions.${display.persistentId}`);
        const submenuItems = [
          {
            label: `Current: ${currentRes}`,
            enabled: false
          },
          { type: 'separator' }
        ];
        
        if (resolutionItems.length > 0) {
          submenuItems.push({
            label: 'Available Resolutions',
            enabled: false
          });
          submenuItems.push(...resolutionItems);
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
