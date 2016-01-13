var app = require('app')
var BrowserWindow = require('browser-window')

app.on('ready', function() {
  var mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    minWidth: 600
  })
  mainWindow.loadURL('file://' + __dirname + '/main.html')
})
