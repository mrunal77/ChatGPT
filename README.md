# Draw.io (diagrams.net) Electron Wrapper

This small Electron app opens the diagrams.net (draw.io) web app inside an Electron BrowserWindow.

Quick start

```bash
cd /home/mrunal/Projects/draw.io
npm install --save-dev electron
npm start
```

Notes

- The app loads `https://app.diagrams.net/?embed=1` in embed mode. Remove `?embed=1` if you want the full site chrome.
- For file open/save integration, add IPC handlers in `src/preload.js` and implement main-process handlers in `src/main.js`.
- To build distributables, use `electron-builder` or `electron-packager`.
