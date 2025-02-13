// ============================================================================
// Implements the redux store for the main process.
// ============================================================================

import { combineReducers, createStore, applyMiddleware } from "redux";
import { appReducers } from "@state/app-reducers";
import { MessengerBase } from "@core/messaging/MessengerBase";
import {
  Channel,
  DefaultResponse,
  ForwardActionRequest,
  RequestMessage,
  ResponseMessage,
} from "@core/messaging/message-types";
import { KliveAction } from "@state/state-core";
import { BrowserWindow, ipcMain, IpcMainEvent } from "electron";
import { getInitialAppState } from "@state/AppState";
import { KliveStore } from "@state/KliveStore";
import {
  registerService,
  STORE_SERVICE,
} from "@core/service-registry";

// Indicates if we're in forwarding mode
let isForwarding = false;

/**
 * This middleware function forwards the action originated in the main process
 * to the renderer processes of browser windows.
 */
const forwardToRendererMiddleware =
  () => (next: any) => async (action: KliveAction) => {
    if (!isForwarding) {
      ideStateMessenger?.forwardAction(action);
      emuStateMessenger?.forwardAction(action);
    }

    // --- Next middleware element
    return next(action);
  };

/**
 * Represents the master replica of the app state
 */
const mainStore = new KliveStore(
  createStore(
    combineReducers(appReducers),
    getInitialAppState(),
    applyMiddleware(forwardToRendererMiddleware)
  )
);

/**
 * This class forwards state changes in main to a particular renderer
 */
class MainToRendererStateForwarder extends MessengerBase {
  /**
   * Initializes the listener that processes responses
   */
  constructor(public readonly window: BrowserWindow) {
    super();
    ipcMain.on(
      this.responseChannel,
      (_ev: IpcMainEvent, response: ResponseMessage) =>
        this.processResponse(response)
    );
  }

  /**
   * Forwards the specified application state to the renderer
   * @param state
   */
  async forwardAction(action: KliveAction): Promise<DefaultResponse> {
    return (await this.sendMessage({
      type: "ForwardAction",
      sourceId: "main",
      action,
    })) as DefaultResponse;
  }

  /**
   * Sends out the message
   * @param message Message to send
   */
  protected send(message: RequestMessage): void {
    try {
      this.window.webContents.send(this.requestChannel, message);
    } catch {
      // --- This exception in intentionally ignored
    }
  }

  /**
   * The channel to send the request out
   */
  readonly requestChannel: Channel = "RendererStateRequest";

  /**
   * The channel to listen for responses
   */
  readonly responseChannel: Channel = "MainStateResponse";
}

// --- Messenger instances
let emuStateMessenger: MainToRendererStateForwarder | null = null;
let ideStateMessenger: MainToRendererStateForwarder | null = null;

/**
 * Registers the EmuWindow instance
 * @param window BorwserWindow instance
 */
export function registerEmuWindowForwarder(window: BrowserWindow): void {
  emuStateMessenger = new MainToRendererStateForwarder(window);
}

/**
 * Registers the EmuWindow instance
 * @param window BorwserWindow instance
 */
export function registerIdeWindowForwarder(window: BrowserWindow): void {
  ideStateMessenger = new MainToRendererStateForwarder(window);
}

/**
 * Forwards the state received from a renderer to the other
 * @param stateMessage
 */
export function forwardRendererState(
  actionMessage: ForwardActionRequest
): void {
  isForwarding = true;
  try {
    mainStore.dispatch(actionMessage.action);
    if (actionMessage.sourceId === "emu" && ideStateMessenger) {
      ideStateMessenger.forwardAction(actionMessage.action);
    } else if (actionMessage.sourceId === "ide" && emuStateMessenger) {
      emuStateMessenger.forwardAction(actionMessage.action);
    }
  } finally {
    isForwarding = false;
  }
}

/**
 * Registers the main store
 */
export function registerMainStore() {
  registerService(STORE_SERVICE, mainStore);
}
