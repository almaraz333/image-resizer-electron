const { contextBridge, ipcRenderer } = require("electron");
const os = require("os");
const path = require("path");
const toastify = require("toastify-js");

contextBridge.exposeInMainWorld("os", {
  homeDir: () => os.homedir(),
});

contextBridge.exposeInMainWorld("path", {
  join: (...args) => path.join(...args),
});

contextBridge.exposeInMainWorld("toast", {
  toast: (options) => toastify(options).showToast(),
});

contextBridge.exposeInMainWorld("ipcRenderer", {
  send: (channel, data) => ipcRenderer.send(channel, data),
  on: (channel, func) =>
    ipcRenderer.on(channel, (event, ...args) => func(...args)),
});
