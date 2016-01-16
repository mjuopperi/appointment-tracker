var app = require('app');
var BrowserWindow = require('browser-window');

app.on('window-all-closed', function() {
  if (process.platform != 'darwin') {
    app.quit();
  }
});

app.on('ready', function() {
  var mainWindow = new BrowserWindow({
    width: 1000,
    height: 600,
    minWidth: 1000
  });
  mainWindow.loadURL('file://' + __dirname + '/main.html')
});
