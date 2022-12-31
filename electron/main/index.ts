import { RequestMessage } from '@messaging/message-types'
import { isWindowsAction } from '../../common/state/actions'
import { Unsubscribe } from '@state/redux-light'
import { app, BrowserWindow, shell, ipcMain } from 'electron'
import { release } from 'os'
import { join } from 'path'
import { setupMenu } from '../app-menu'
import { __WIN32__ } from '../electron-utils'
import { processEmuToMainMessages } from '../EmuToMainProcessor'
import { setMachineType } from '../machines'
import { mainStore } from '../main-store'
import { registerMainToEmuMessenger } from '../MainToEmuMessenger'

const EMU_QP = "?emu";
const IDE_QP = "?ide";

process.env.DIST_ELECTRON = join(__dirname, '../..')
process.env.DIST = join(process.env.DIST_ELECTRON, '../dist')
process.env.PUBLIC = app.isPackaged ? process.env.DIST : join(process.env.DIST_ELECTRON, '../public')

// Disable GPU Acceleration for Windows 7
if (release().startsWith('6.1')) app.disableHardwareAcceleration()

// Set application name for Windows 10+ notifications
if (process.platform === 'win32') app.setAppUserModelId(app.getName())

if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}

let emuWindow: BrowserWindow | null = null;
let storeUnsubscribe: Unsubscribe | undefined;
let machineTypeInitialized = false;

// Here, you can also use other preload
const preload = join(__dirname, "../preload/index.js")
const url = process.env.VITE_DEV_SERVER_URL + IDE_QP
const indexHtml = join(process.env.DIST, "index.html")
async function createWindow() {
  // --- Create the emulator window
  emuWindow = new BrowserWindow({
    title: 'Main window',
    icon: join(process.env.PUBLIC, 'favicon.svg'),
    minWidth: 640,
    minHeight: 480,
    webPreferences: {
      preload,
      nodeIntegration: true,
      contextIsolation: false,
    },
  })

  // --- Initialize messaging from the main process to the emulator window
  registerMainToEmuMessenger(emuWindow);

  // --- Prepare the main menu. Update items on application state change
  setupMenu(emuWindow);
  storeUnsubscribe = mainStore.subscribe(async () => {
    if (!machineTypeInitialized) {
      machineTypeInitialized = true;
      await setMachineType("sp48");
      mainStore.dispatch(isWindowsAction(__WIN32__));
    }
    setupMenu(emuWindow);
  });

  if (process.env.VITE_DEV_SERVER_URL) { // electron-vite-vue#298
    emuWindow.loadURL(url)
    // Open devTool if the app is not packaged
    emuWindow.webContents.openDevTools()
  } else {
    emuWindow.loadFile(indexHtml, {
      search: IDE_QP
    })
  }

  // Test actively push message to the Electron-Renderer
  emuWindow.webContents.on('did-finish-load', () => {
    emuWindow?.webContents.send('main-process-message', new Date().toLocaleString())
  })

  // Make all links open with the browser, not with the application
  emuWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:')) shell.openExternal(url)
    return { action: 'deny' }
  })
}

app.whenReady().then(() => {
  createWindow();
})

app.on("window-all-closed", () => {
  storeUnsubscribe();
  emuWindow = null
  if (process.platform !== 'darwin') app.quit()
})

app.on("second-instance", () => {
  if (emuWindow) {
    // Focus on the main window if the user tried to open another
    if (emuWindow.isMinimized()) emuWindow.restore()
    emuWindow.focus()
  }
})

app.on("activate", () => {
  const allWindows = BrowserWindow.getAllWindows()
  if (allWindows.length) {
    allWindows[0].focus()
  } else {
    // --- Let's initialize the machine type again after creating the window
    machineTypeInitialized = false;
    createWindow();
  }
})

// --- This channel processes emulator requests and sends the results back
ipcMain.on("EmuToMain", async (_ev, msg: RequestMessage) => {
  const response = await processEmuToMainMessages(msg, emuWindow);
  response.correlationId = msg.correlationId;
  if (emuWindow?.isDestroyed() === false) {
    emuWindow.webContents.send("EmuToMainResponse", response);
  }
});
