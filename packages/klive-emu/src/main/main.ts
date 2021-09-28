// ============================================================================
// The startup file of the main Electron process
// ============================================================================

import { BrowserWindow, app, ipcMain } from "electron";
import { dispatch, forwardRendererState } from "./main-state/main-store";
import {
  EMU_TO_MAIN_REQUEST_CHANNEL,
  EMU_TO_MAIN_RESPONSE_CHANNEL,
  IDE_TO_EMU_MAIN_REQUEST_CHANNEL,
  IDE_TO_EMU_MAIN_RESPONSE_CHANNEL,
  MAIN_STATE_REQUEST_CHANNEL,
} from "../shared/messaging/channels";
import { ForwardActionRequest } from "../shared/messaging/message-types";
import {
  emuMessenger,
  emuWindow,
  ideWindow,
  setupMenu,
  setupWindows,
  watchStateChanges,
} from "./app/app-menu";
import {
  appConfiguration,
  appSettings,
} from "./main-state/klive-configuration";
import {
  emuHideFrameInfoAction,
  emuHideKeyboardAction,
  emuHideStatusbarAction,
  emuHideToolbarAction,
  emuShowFrameInfoAction,
  emuShowKeyboardAction,
  emuShowStatusbarAction,
  emuShowToolbarAction,
} from "../shared/state/emu-view-options-reducer";
import { __WIN32__ } from "./utils/electron-utils";
import { setWindowsAction } from "../shared/state/is-windows-reducer";
import {
  processEmulatorRequest,
  processIdeRequest,
} from "./communication/process-messages";

// --- This method will be called when Electron has finished
// --- initialization and is ready to create browser windows.
// --- Some APIs can only be used after this event occurs.
app.on("ready", async () => {
  // --- Is Klive running on Windows?
  await setupWindows();
  watchStateChanges();
  setupMenu();
  dispatch(setWindowsAction(__WIN32__));

  // --- Set up application state according to saved settings
  if (appSettings) {
    const viewOptions = appSettings.viewOptions;
    if (viewOptions) {
      dispatch(
        viewOptions.showToolbar
          ? emuShowToolbarAction()
          : emuHideToolbarAction()
      );
      dispatch(
        viewOptions.showStatusbar
          ? emuShowStatusbarAction()
          : emuHideStatusbarAction()
      );
      dispatch(
        viewOptions.showFrameInfo
          ? emuShowFrameInfoAction()
          : emuHideFrameInfoAction()
      );
      dispatch(
        viewOptions.showKeyboard
          ? emuShowKeyboardAction()
          : emuHideKeyboardAction()
      );
    }
  }

  // --- Make sure that application configuration is sent to renderers
  emuMessenger.sendMessage({
    type: "ForwardAppConfig",
    config: appConfiguration,
  });

  // --- Create the machine and set its state according to the saved settings
  const initialMachineType =
    appSettings?.machineType ?? appConfiguration?.machineType ?? "sp48";
  const settings = appSettings?.machineSpecific?.[initialMachineType];
  await emuWindow.requestMachineType(initialMachineType, undefined, settings);
});

// --- Quit when all windows are closed.
app.on("window-all-closed", () => {
  // --- On OS X it is common for applications and their menu bar
  // --- to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// --- Set up windows before the first activation
app.on("activate", async () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    await setupWindows();
    setupMenu();
    watchStateChanges();
  }
});

// --- Make sure the application settings are saved
app.on("before-quit", () => {
  emuWindow.saveAppSettings();
  ideWindow.allowClose = true;
});

// --- This channel forwards renderer state (Emu or IDE) to the other renderer (IDE or Emu)
ipcMain.on(MAIN_STATE_REQUEST_CHANNEL, (_ev, msg: ForwardActionRequest) => {
  forwardRendererState(msg);
});

// --- This channel processes requests arriving from the Emu process
ipcMain.on(
  EMU_TO_MAIN_REQUEST_CHANNEL,
  async (_ev, msg: ForwardActionRequest) => {
    const response = await processEmulatorRequest(msg);
    response.correlationId = msg.correlationId;
    if (emuWindow?.window.isDestroyed() === false) {
      emuWindow.window.webContents.send(EMU_TO_MAIN_RESPONSE_CHANNEL, response);
    }
  }
);

// --- This channel processes requests arriving from the Emu process
ipcMain.on(
  IDE_TO_EMU_MAIN_REQUEST_CHANNEL,
  async (_ev, msg: ForwardActionRequest) => {
    const response = await processIdeRequest(msg);
    response.correlationId = msg.correlationId;
    if (ideWindow?.window.isDestroyed() === false) {
      ideWindow.window.webContents.send(
        IDE_TO_EMU_MAIN_RESPONSE_CHANNEL,
        response
      );
    }
  }
);
