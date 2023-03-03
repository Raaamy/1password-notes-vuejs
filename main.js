const { app, BrowserWindow } = require('electron')
const path = require('path');

let mainWindow // Declare a variable for the main window

function createWindow () {
  mainWindow = new BrowserWindow({
    width: 1300,
    height: 800,
    icon: path.join(__dirname, 'build', 'appicon.icns'),
    webPreferences: {
      nodeIntegration: true // Enable Node.js integration in renderer processes
    }
  })

  mainWindow.loadURL('http://192.168.192.1:8080') // Load your Vue.js app URL

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})