const {app, BrowserWindow} = require('electron');
const path = require('path');
const url = require('url');
const logEverywhere = require('./utilities');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

// Deep linked url used to launch app
let deeplinkingUrl = [];

// Force Single Instance Application
const shouldQuit = app.makeSingleInstance((argv, workingDirectory) => {
  // Someone tried to run a second instance, we should focus our window.

  // Protocol handler for win32
  // argv: An array of the second instance’s (command line / deep linked) arguments
  if (process.platform == 'win32') {
    // Keep only command line / deep linked arguments
    deeplinkingUrl = argv.slice(1)[1];
  }
  logEverywhere("app.makeSingleInstance# " + deeplinkingUrl, mainWindow);

  if (mainWindow) {
    if (mainWindow.isMinimized()){
      mainWindow.restore();
      mainWindow.focus();
    }
  }
});

if (shouldQuit) {
    app.quit();
    return;
}

function createWindow () {
  mainWindow = new BrowserWindow(
    {
      width: 800,
      height: 600,
    }
  )
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }));

  // Open the DevTools.
  mainWindow.webContents.openDevTools();

  // Protocol handler for win32
  if (process.platform == 'win32') {
    // Keep only command line / deep linked arguments
    deeplinkingUrl = process.argv.slice(1)[1];
  }

  if(!deeplinkingUrl){
    deeplinkingUrl = 'activated';
  }
  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    mainWindow = null;
  })

  const components = url.parse(deeplinkingUrl, true);
  logEverywhere("Scheme : " + components.protocol, mainWindow);
  logEverywhere("Host : " + components.host, mainWindow);
  logEverywhere("Pathname : " + components.pathname, mainWindow);
  const params = components.query;
  logEverywhere("Query : " + params.t, mainWindow);

  if(components.protocol == "celestial:" && components.host == "localhost:5000"){
    logEverywhere("Ok.", mainWindow);
  }else{
    app.exit();
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
});

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

if(process.platform == "win32"){
  app.setAsDefaultProtocolClient('celestial', process.execPath, [path.resolve(process.argv[1])]);
}else{
  app.setAsDefaultProtocolClient('celestial');
}


// Protocol handler for osx
app.on('open-url', function (event, url) {
  event.preventDefault();
  deeplinkingUrl = url;
  logEverywhere("open-url# " + deeplinkingUrl, mainWindow);
});