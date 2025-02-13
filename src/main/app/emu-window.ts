import * as path from "path";

import { app, dialog } from "electron";
import { AppWindow } from "./app-window";
import { __DARWIN__ } from "../utils/electron-utils";
import { RequestMessage } from "@core/messaging/message-types";
import { MachineContextProvider } from "@core/main/machine-context";
import { MachineCreationOptions } from "../../core/abstractions/vm-core-types";
import {
  emuMachineContextAction,
  emuSetBaseFrequencyAction,
  emuSetExecutionStateAction,
  emuSetExtraFeaturesAction,
} from "@state/emulator-panel-reducer";
import { setEmuForwarder } from "./app-menu";
import {
  appSettings,
  reloadSettings,
  saveKliveSettings,
  saveSettingsToFile,
} from "../main-state/klive-configuration";
import { emuFocusAction } from "@state/emu-focus-reducer";
import { MainToEmuForwarder } from "../communication/MainToEmuForwarder";
import { machineRegistry } from "@core/main/machine-registry";
import { MainToEmulatorMessenger } from "../communication/MainToEmulatorMessenger";
import { PROJECT_FILE } from "../project/project-utils";
import {
  registerMainToEmuMessenger,
  sendFromMainToEmu,
} from "@core/messaging/message-sending";
import { dispatch, getState } from "@core/service-registry";
import { registerEmuWindowForwarder } from "../main-state/main-store";
import { KliveProject, KliveSettings } from "@abstractions/klive-configuration";
import { mainProcLogger } from "../utils/MainProcLogger";

/**
 * Represents the singleton emulator window
 */
class EmuWindow extends AppWindow {
  private _machineContextProvider: MachineContextProvider;

  /**
   * Initializes the window instance
   */
  constructor() {
    super(true);
    registerMainToEmuMessenger(new MainToEmulatorMessenger(this.window));
    setEmuForwarder(new MainToEmuForwarder(this.window));
  }

  /**
   * Get the machine context provider of this instance
   */
  get machineContextProvider(): MachineContextProvider {
    return this._machineContextProvider;
  }

  /**
   * The name of the file that provides the window's contents
   */
  get contentFile(): string {
    return "emu-index.html";
  }

  /**
   * The file to store the window state
   */
  get stateFile(): string {
    return "emu-window-state.json";
  }

  /**
   * Loads the contenst of the main window
   */
  load(): void {
    super.load();
    if (mainProcLogger.initError) {
      dialog.showMessageBox({
        message: mainProcLogger.initError,
      });
    }
  }

  /**
   * The window has been closed
   */
  onClosed(): void {
    app.quit();
  }

  /**
   * The window receives the focus
   */
  onFocus() {
    super.onFocus();
    dispatch(emuFocusAction(true));
  }

  /**
   * The window loses the focus
   */
  onBlur() {
    super.onBlur();
    dispatch(emuFocusAction(false));
  }

  /**
   * Saves the current application settings
   */
  saveAppSettings(): void {
    const state = getState();
    const machineType = state.machineType.split("_")[0];
    const kliveSettings: KliveSettings = {
      machineType,
      viewOptions: {
        showToolbar: state.emuViewOptions.showToolbar,
        showSidebar: state.emuViewOptions.showSidebar,
        showFrameInfo: state.emuViewOptions.showFrameInfo,
        showKeyboard: state.emuViewOptions.showKeyboard,
        showStatusbar: state.emuViewOptions.showStatusBar,
        keyboardHeight: state.emulatorPanel.keyboardHeight,
      },
      ide: appSettings?.ide,
    };
    if (this._machineContextProvider) {
      kliveSettings.machineSpecific = appSettings?.machineSpecific;
      if (!kliveSettings.machineSpecific) {
        kliveSettings.machineSpecific = {};
      }
      kliveSettings.machineSpecific[machineType] =
        this._machineContextProvider.getMachineSpecificSettings();
    }
    saveKliveSettings(kliveSettings);
    reloadSettings();
  }

  /**
   * Saves the project file changes to the current Klive project
   */
  saveKliveProject(): void {
    const project = getState().project;
    if (!project?.hasVm || !project?.path) {
      // --- No VM in the current project, nothing to save
      return;
    }

    const state = getState();
    const machineType = state.machineType.split("_")[0];
    const kliveSettings: KliveProject = {
      machineType,
      viewOptions: {
        showToolbar: state.emuViewOptions.showToolbar,
        showSidebar: state.emuViewOptions.showSidebar,
        showFrameInfo: state.emuViewOptions.showFrameInfo,
        showKeyboard: state.emuViewOptions.showKeyboard,
        showStatusbar: state.emuViewOptions.showStatusBar,
        keyboardHeight: state.emulatorPanel.keyboardHeight,
      },
      debugger: state.debugger,
      builder: state.builder,
      ide: state.ideConfig,
    };
    if (this._machineContextProvider) {
      kliveSettings.machineSpecific =
        this._machineContextProvider.getMachineSpecificSettings();
    }
    const projectFile = path.join(project.path, PROJECT_FILE);
    saveSettingsToFile(kliveSettings, projectFile);
  }

  // ==========================================================================
  // IEmuAppWindow implementation

  /**
   * Posts a message from the renderer to the main
   * @param _message Message contents
   */
  postMessageToEmulator(_message: RequestMessage): void {}

  /**
   * Requests a machine type according to its menu ID
   * @param id Machine type, or menu ID of the machine type
   * @param options Machine construction options
   */
  async requestMachineType(
    id: string,
    options?: MachineCreationOptions,
    settings?: KliveSettings
  ): Promise<void> {
    // Preparation: Stop the current machine
    sendFromMainToEmu({ type: "StopVm" });

    // Use only the first segment of the ID
    id = id.split("_")[0];

    // #1: Create the context provider for the machine
    const contextProvider = machineRegistry.get(id)?.implementor;
    if (!contextProvider) {
      this.showError(
        `Cannot find a context provider for '${id}'.`,
        "Internal error"
      );
      return;
    }

    // #2: Set up the firmware
    this._machineContextProvider = new (contextProvider as any)(
      options
    ) as MachineContextProvider;
    const firmware = this._machineContextProvider.getFirmware(options);
    if (typeof firmware === "string") {
      this.showError(`Cannot load firmware: ${firmware}.`, "Internal error");
      return;
    }

    // #3: Set up machine-specific settings
    let extraOptions: MachineCreationOptions | null = null;
    if (settings) {
      extraOptions =
        await this._machineContextProvider.setMachineSpecificSettings(settings);
    }

    // #4: Instantiate the machine
    const creationOptions = {
      ...options,
      firmware,
      ...extraOptions,
    } as MachineCreationOptions;
    const requestMessage: RequestMessage = {
      type: "CreateMachine",
      machineId: id,
      options: creationOptions,
    };
    await sendFromMainToEmu(requestMessage);

    // #4: Sign extra machine features
    dispatch(
      emuSetExtraFeaturesAction(
        this._machineContextProvider.getExtraMachineFeatures()
      )
    );

    // #5: Set up the machine specific description
    dispatch(
      emuMachineContextAction(
        this._machineContextProvider.getMachineContextDescription()
      )
    );
    dispatch(
      emuSetBaseFrequencyAction(
        this._machineContextProvider.getNormalCpuFrequency()
      )
    );

    // #6: Set the default execution state
    dispatch(emuSetExecutionStateAction(0));
  }

  // ==========================================================================
  // Helpers

  /**
   * Ensures that the Emulator UI is started
   */
  async ensureStarted(): Promise<void> {
    return new Promise<void>((resolve) => {
      const interval = setInterval(() => {
        if (getState().emuUiLoaded) {
          clearInterval(interval);
          resolve();
        }
      }, 20);
    });
  }

  /**
   * Displays an error message in a pop-up
   * @param message
   */
  async showError(message: string, title = "Error"): Promise<void> {
    await dialog.showMessageBox(this.window, {
      title,
      message,
      type: "error",
    });
  }
}

/**
 * The singleton instance of the Emulator window
 */
export let emuWindow: EmuWindow;

/**
 * Completes the setup of the emulator window
 */
export async function setupEmuWindow(): Promise<void> {
  emuWindow = new EmuWindow();
  emuWindow.load();
  registerEmuWindowForwarder(emuWindow.window);
  await emuWindow.ensureStarted();
}
