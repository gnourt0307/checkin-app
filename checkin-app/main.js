const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const os = require("os");

function createWindow() {
  const win = new BrowserWindow({
    width: 600,
    height: 480, // slightly taller for new UI
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // win.webContents.openDevTools();

  win.loadFile(path.join(__dirname, "dist", "index.html"));
}

app.whenReady().then(() => {
  ipcMain.handle("get-mac", () => {
    const interfaces = os.networkInterfaces();
    for (let name in interfaces) {
      for (let net of interfaces[name]) {
        if (!net.internal && net.mac !== "00:00:00:00:00:00") {
          return net.mac;
        }
      }
    }
    return null;
  });
  createWindow();
});
