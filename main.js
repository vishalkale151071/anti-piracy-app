const {app, BrowserWindow, ipcMain} = require('electron');
const { Http2ServerRequest } = require('http2');
const path = require('path');
const url = require('url');
const  { logEverywhere, decomposeUrl, intiPlugin, sendReport } = require('./utilities');
const Store = require('electron-store');

const store = new Store();
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
// Deep linked url used to launch app
let deeplinkingUrl = null;

// Force Single Instance Application
const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', (event, args) => {
    // Someone tried to run a second instance, we should focus our window.
    const  { pathName, hostName, params } = decomposeUrl(args.slice()[2]);
    
    if(pathName == "/quit"){
      app.quit();
    }

    switch(pathName){
      case '/quit':
        app.quit;
        break;
      
      case '/start-detecting':
        let token = store.get('token'); 
        if(!token){
          app.quit();
        }
        sendReport(mainWindow, hostName, token);
        break;
    }

    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
  })

  // Create myWindow, load the rest of the app, etc...
  app.on('ready', createWindow);
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
    store.clear();
    mainWindow = null;
  })

  const  { protocolName, pathName, hostName, params} = decomposeUrl(deeplinkingUrl);

  if(protocolName == "celestial:" && hostName == "localhost:5000" && pathName ==  '/start' && params.t){
    logEverywhere("Ok.", mainWindow);
    intiPlugin(hostName, params.t, mainWindow);
    store.set('token', params.t)
  }else{
    store.clear();
    app.quit();
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
//app.on('ready', createWindow);

// Quit when all windows are closed.
// app.on('window-all-closed', function () {
//   // On OS X it is common for applications and their menu bar
//   // to stay active until the user quits explicitly with Cmd + Q
//   if (process.platform !== 'darwin') {
//     app.quit()
//   }
// });

// app.on('activate', function () {
//   // On OS X it's common to re-create a window in the app when the
//   // dock icon is clicked and there are no other windows open.
//   if (mainWindow === null) {
//     createWindow();
//   }
// });

if(process.platform == "win32"){
  app.setAsDefaultProtocolClient('celestial', process.execPath, [path.resolve(process.argv[1])]);
}else{
  app.setAsDefaultProtocolClient('celestial');
}

// Protocol handler for osx
// app.on('open-url', function (event, url) {
//   event.preventDefault();
//   deeplinkingUrl = url;
//   logEverywhere("open-url# " + deeplinkingUrl, mainWindow);
// });

ipcMain.on('close', (event, arg) => {
  store.clear();
  app.quit();
});