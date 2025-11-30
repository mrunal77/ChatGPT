const { app, BrowserWindow, Menu, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const { nativeImage } = require('electron');

function createWindow() {
  // Choose an icon if available. Prefer PNG (cross-platform), fall back to SVG.
  const assetsDir = path.join(__dirname, '..', 'assets');
  const pngIcon = path.join(assetsDir, 'icon.png');
  const svgIcon = path.join(assetsDir, 'icon.svg');

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

  // Hide the native menu bar on the window (cross-platform)
  win.setMenuBarVisibility(false);

  // Load diagrams.net (draw.io) in embed mode to remove its own chrome/menus
  win.loadURL('https://chatgpt.com/?embed=1');

  // Open links that request a new window (target="_blank" or window.open)
  // in the user's default browser instead of inside the Electron window.
  win.webContents.setWindowOpenHandler(({ url }) => {
    // Use shell.openExternal for all urls that are not our app's URL
    shell.openExternal(url).catch(() => {});
    return { action: 'deny' };
  });

  // Also intercept navigations inside the webContents (single-window links).
  win.webContents.on('will-navigate', (event, url) => {
    const current = win.webContents.getURL();
    // If navigation target differs from current URL, open externally
    if (url !== current) {
      event.preventDefault();
      shell.openExternal(url).catch(() => {});
    }
  });

  // Optional: open DevTools for debugging
  // win.webContents.openDevTools();
}

app.whenReady().then(() => {
  // Remove the application menu (prevents default menu showing on Linux/Windows)
  Menu.setApplicationMenu(null);

  // On macOS, set a dock icon. Prefer SVG (vector) fallback, or PNG if provided.
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
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
