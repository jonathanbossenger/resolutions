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
  // Create a simple tray icon (1x1 transparent pixel as fallback)
  const icon = nativeImage.createEmpty();
  icon.addRepresentation({
    scaleFactor: 1.0,
    buffer: Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAdgAAAHYBTnsmCAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAABXSURBVDiNY2AYBaNgFAxnwPifgYGBgYHh/38GBgYGBobz/1H4DAwM5/8jy5//j64GXQ1MDYo8hgEYBmAYgGHAaA5ANwBdHl0NTM3///8xDECRHwWjYBgDAACNYAff6VjZdQAAAABJRU5ErkJggg==',
      'base64'
    )
  });
  
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
