const { app, BrowserWindow, Menu, shell, dialog, nativeImage } = require('electron');
const path = require('path');
const fs = require('fs');

// Basic startup logging and global error handlers to help diagnose freezes/crashes
console.log('Main process starting', { argv: process.argv.slice(), pid: process.pid, platform: process.platform });
process.on('uncaughtException', (err) => {
  console.error('UncaughtException in main process:', err && err.stack ? err.stack : err);
});
process.on('unhandledRejection', (reason) => {
  console.error('UnhandledRejection in main process:', reason);
});

let mainWindow = null;

function createWindow() {
  try {
    const assetsDir = path.join(__dirname, '..', 'assets');
    const pngIcon = path.join(assetsDir, 'icon.png');

    const browserWindowOptions = {
      width: 1200,
      height: 800,
      autoHideMenuBar: true,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        contextIsolation: true,
        nodeIntegration: false
      }
    };

    if (fs.existsSync(pngIcon)) {
      browserWindowOptions.icon = pngIcon;
    }

    const win = new BrowserWindow(browserWindowOptions);
    win.setMenuBarVisibility(false);
    win.loadURL('https://chatgpt.com/?embed=1');

    // Add a simple context menu to support copy/cut/paste/select-all
    win.webContents.on('context-menu', (event, params) => {
      const template = [];
      if (params.selectionText && params.selectionText.trim() !== '') {
        template.push({ label: 'Copy', role: 'copy' });
      }
      if (params.isEditable) {
        template.push({ label: 'Cut', role: 'cut' });
        template.push({ label: 'Paste', role: 'paste' });
      }
      template.push({ type: 'separator' }, { label: 'Select All', role: 'selectAll' });
      if (template.length > 0) {
        const menu = Menu.buildFromTemplate(template);
        menu.popup({ window: win });
      }
    });

    // Keep navigation inside the BrowserWindow (do not open external login windows)
    win.webContents.on('will-navigate', (event, url) => {
      // allow navigation within the app window
    });

    mainWindow = win;
    return win;
  } catch (e) {
    console.error('createWindow error:', e && e.stack ? e.stack : e);
    throw e;
  }
}

app.whenReady().then(() => {
  try {
    Menu.setApplicationMenu(null);

    const assetsDir = path.join(__dirname, '..', 'assets');
    const svgIcon = path.join(assetsDir, 'icon.svg');
    const pngIcon = path.join(assetsDir, 'icon.png');

    if (process.platform === 'darwin') {
      if (fs.existsSync(svgIcon)) {
        const svg = fs.readFileSync(svgIcon, 'utf8');
        const dataUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
        try {
          const img = nativeImage.createFromDataURL(dataUrl);
          app.dock.setIcon(img);
        } catch (e) {
          // ignore if creation fails
        }
      } else if (fs.existsSync(pngIcon)) {
        try {
          const img = nativeImage.createFromPath(pngIcon);
          app.dock.setIcon(img);
        } catch (e) {
          // ignore
        }
      }
    }

    createWindow();
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  } catch (e) {
    console.error('Error in whenReady handler:', e && e.stack ? e.stack : e);
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});