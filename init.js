const { app, BrowserWindow } = require('electron')
const path = require('path')
 
function createWindow () {
  const win = new BrowserWindow({
    width: 1400,
    height: 800,
    icon:"img/icon.png",
    show:false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })
  win.maximize();
  win.show();
  win.loadFile('index.html');
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
