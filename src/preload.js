const { contextBridge } = require('electron');
const Store = require('electron-store');

const store = new Store({
  name: 'user-preferences'
});

contextBridge.exposeInMainWorld('electron', {
  electronVersion: () => process.versions.electron,

  // Persistent storage for simple preferences like "lastLogin"
  getLastLogin: () => {
    return store.get('lastLogin', null);
  },

  setLastLogin: (value) => {
    // value should be a non-sensitive identifier (username/email). Do not store raw passwords here.
    store.set('lastLogin', value);
    return true;
  }
});
