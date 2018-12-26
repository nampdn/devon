import {
  app,
  BrowserWindow,
  Menu,
  nativeImage,
  shell,
  TouchBar,
  Tray,
} from 'electron'
import fs from 'fs'
import path from 'path'
import url from 'url'

let mainWindow: Electron.BrowserWindow
let menubarWindow: Electron.BrowserWindow
let tray: Electron.Tray

const startURL =
  process.env.NODE_ENV === 'development'
    ? `http://${process.env.HOST || 'localhost'}:${process.env.PORT || 3000}`
    : `file://${path.join(__dirname, '../../web/dist/index.html')}`

app.dock.hide()

const template: Electron.MenuItemConstructorOptions[] = [
  {
    label: 'Edit',
    submenu: [
      {
        label: 'Undo',
        accelerator: 'CmdOrCtrl+Z',
        role: 'undo',
      },
      {
        label: 'Redo',
        accelerator: 'Shift+CmdOrCtrl+Z',
        role: 'redo',
      },
      {
        type: 'separator',
      },
      {
        label: 'Cut',
        accelerator: 'CmdOrCtrl+X',
        role: 'cut',
      },
      {
        label: 'Copy',
        accelerator: 'CmdOrCtrl+C',
        role: 'copy',
      },
      {
        label: 'Paste',
        accelerator: 'CmdOrCtrl+V',
        role: 'paste',
      },
      {
        label: 'Select All',
        accelerator: 'CmdOrCtrl+A',
        role: 'selectall',
      },
    ],
  },
  {
    label: 'View',
    submenu: [
      {
        label: 'Reload',
        accelerator: 'CmdOrCtrl+R',
      },
    ],
  },
  {
    label: 'Window',
    role: 'window',
    submenu: [
      {
        label: 'Minimize',
        accelerator: 'CmdOrCtrl+M',
        role: 'minimize',
      },
      {
        label: 'Close',
        accelerator: 'CmdOrCtrl+W',
        role: 'close',
      },
    ],
  },
  {
    type: 'separator',
  },
  {
    label: 'Bring All to Front',
    role: 'front',
  },
  {
    label: 'Help',
    role: 'help',
    submenu: [
      {
        label: 'Learn More',
        click: () => {
          shell.openExternal('https://devon.github.io')
        },
      },
    ],
  },
]

if (process.platform === 'darwin') {
  const name = app.getName()
  template.unshift({
    label: name,
    submenu: [
      {
        label: `About ${name}`,
        role: 'about',
      },
      {
        type: 'separator',
      },
      {
        label: `Hide ${name}`,
        accelerator: 'Command+H',
        role: 'hide',
      },
      {
        label: 'Hide Others',
        accelerator: 'Command+Alt+H',
        role: 'hideothers',
      },
      {
        type: 'separator',
      },
      {
        label: 'Quit',
        accelerator: 'Command+Q',
        click: () => {
          app.quit()
        },
      },
    ],
  })
}

function createWindow() {
  mainWindow = new BrowserWindow({
    minWidth: 320,
    width: 340,
    minHeight: 400,
    height: 550,
    show: false,
    webPreferences: {
      affinity: 'main-window',
      nativeWindowOpen: true,
      nodeIntegration: true,
    },
  })

  mainWindow.loadURL(startURL)

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow.destroy()
  })

  // Show window when page is ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
    const menu = Menu.buildFromTemplate(template)
    Menu.setApplicationMenu(menu)
    if (process.platform === 'darwin') {
      const spin = new TouchBar.TouchBarButton({
        label: 'devon',
      })

      const touchBar = new TouchBar({
        items: [spin],
      })
      mainWindow.setTouchBar(touchBar)
    }
  })

  mainWindow.on('move', () => {
    const [x, y] = mainWindow.getPosition()
    if (y <= 100) {
      mainWindow.hide()
      showMenubarWindow()
    }
  })
}

function createMenubarWindow() {
  menubarWindow = new BrowserWindow({
    minWidth: 320,
    width: 340,
    minHeight: 400,
    height: 550,
    show: false,
    frame: false,
    fullscreenable: false,
    movable: true,
    hasShadow: false,
    transparent: true,
    icon: path.join(__dirname, '../assets/icons/icon.png'),
    webPreferences: {
      affinity: 'menubar-window',
      backgroundThrottling: false,
      nativeWindowOpen: true,
      nodeIntegration: true,
    },
  })
  menubarWindow.loadURL(startURL)
  const webContents = menubarWindow.webContents

  webContents.on('dom-ready', () => {
    const position = getWindowPosition()
    setWindowPosition(menubarWindow, position.x, position.y)
    webContents.insertCSS(
      fs.readFileSync(path.join(__dirname, '../assets/css/arrow.css'), 'utf8'),
    )
    menubarWindow.show()
    menubarWindow.focus()
  })

  // Hide the window when it loses focus
  menubarWindow.on('blur', () => {
    menubarWindow.hide()
  })

  menubarWindow.on('move', () => {
    const [x, y] = menubarWindow.getPosition()
    if (y <= 100) {
      const position = getWindowPosition()
      menubarWindow.setPosition(position.x, position.y, false)
    } else {
      menubarWindow.hide()
      showMainWindow(x, y)
    }
  })
}

function createTray() {
  const trayIcon = nativeImage.createFromPath(
    path.join(
      __dirname,
      `../assets/icons/${
        process.platform === 'win32' ? 'trayIconWhite' : 'trayIconTemplate'
      }.png`,
    ),
  )

  tray = new Tray(trayIcon)

  const trayMenuTemplate = [
    {
      label: 'DevOn',
      click() {
        menubarWindow.hide()
        toggleMainWindow()
      },
    },
    {
      label: 'Quit',
      click() {
        app.quit()
      },
    },
  ]

  tray.on('click', () => {
    toggleMenubarWindow()
  })

  tray.on('right-click', () => {
    const contextMenu = Menu.buildFromTemplate(trayMenuTemplate)
    tray.popUpContextMenu(contextMenu)
  })
}

// Wait until the app is ready
app.on('ready', () => {
  app.setAsDefaultProtocolClient('devon')
  createTray()
  createMenubarWindow()
  if (process.platform === 'darwin') {
    app.setAboutPanelOptions({
      applicationName: 'DevOn',
      applicationVersion: app.getVersion(),
      copyright: 'Copyright 2018',
      credits: 'devon',
    })
  }
})

// window-all-closed
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// activate
app.on('activate', () => {
  if (menubarWindow === null) {
    createTray()
  }
})

app.on('web-contents-created', (_event, webContents) => {
  webContents.on(
    'new-window',
    (event, uri, _frameName, _disposition, _options) => {
      event.preventDefault()
      shell.openExternal(uri)
    },
  )
})

function getWindowPosition() {
  const windowBounds = menubarWindow.getBounds()
  const trayBounds = tray.getBounds()

  // Center window horizontally below the tray icon
  const x = Math.round(
    trayBounds.x + trayBounds.width / 2 - windowBounds.width / 2,
  )

  // Position window 4 pixels vertically below the tray icon
  const y = Math.round(trayBounds.y + trayBounds.height + 4)

  return { x, y }
}

// toggle menubar window
function toggleMenubarWindow() {
  if (menubarWindow.isVisible()) {
    menubarWindow.hide()
  } else {
    showMenubarWindow()
  }
}

// toggle main window
function toggleMainWindow() {
  if (mainWindow === undefined) {
    createWindow()
  } else if (mainWindow.isVisible()) {
    mainWindow.hide()
  } else {
    mainWindow.show()
  }
}

function showMainWindow(x: number, y: number) {
  if (mainWindow === undefined) {
    createWindow()
  } else {
    mainWindow.show()
    mainWindow.focus()
  }
  app.dock.show()
  setWindowPosition(mainWindow, x, y)
}

function showMenubarWindow() {
  const position = getWindowPosition()
  menubarWindow.setPosition(position.x, position.y, false)
  setWindowPosition(menubarWindow, position.x, position.y)
  app.dock.hide()
  menubarWindow.show()
  menubarWindow.focus()
}

function setWindowPosition(
  window: Electron.BrowserWindow,
  x: number,
  y: number,
): void {
  window.setPosition(x, y)
}
