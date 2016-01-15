var app = require('app')
var BrowserWindow = require('browser-window')

app.on('ready', function() {
  var mainWindow = new BrowserWindow({
    width: 1000,
    height: 600,
    minWidth: 1000
  })
  mainWindow.loadURL('file://' + __dirname + '/main.html')
})
