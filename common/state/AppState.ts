import { MachineControllerState } from "@state/MachineControllerState";
import { DocumentState, ToolState } from "@/ide/abstractions";

/**
 * Represents the state of the entire application
 */
 export type AppState = {
    uiLoaded?: boolean;
    isWindows?: boolean;
    theme?: string;
    emuViewOptions?: EmuViewOptions;
    ideView?: IdeView;
}

/**
 * Represents the state of the emulator view options
 */
export type EmuViewOptions = {
    showToolbar?: boolean;
    showStatusBar?: boolean;
    useEmuView?: boolean;
    primaryBarOnRight?: boolean;
    showToolPanels?: boolean;
    toolPanelsOnTop?: boolean;
    maximizeTools?: boolean;
    showFrameInfo?: boolean;
    showKeyboard?: boolean;
    showSidebar?: boolean;
}

export type IdeView = {
    activity?: string;
    sideBarPanels?: Record<string, SideBarPanelState>;
    openDocuments?: DocumentState[];
    activeDocumentIndex?: number;
    tools?: ToolState[];
    activeTool?: string;
    activeOutputPane?: string;
    machineId?: string;
    machineState?: MachineControllerState;
    soundLevel?: number;
    soundMuted?: boolean;
    savedSoundLevel?: number;
    fastLoad?: boolean;
    clockMultiplier?: number;
    audioSampleRate?: number;
    tapeFile?: string;
}

/**
 * The state of a particular site bar panel
 */
export type SideBarPanelState = {
    expanded: boolean;
    size: number;
}

/**
 * The initial application state
 */
export const initialAppState: AppState = {
    uiLoaded: false,
    isWindows: false,
    theme: "dark",
    emuViewOptions:  {
        showToolbar: true,
        showStatusBar: true,
        useEmuView: false,
        primaryBarOnRight: false,
        showToolPanels: true,
        toolPanelsOnTop: false,
        maximizeTools: false,
        showFrameInfo: true,
        showKeyboard: false,
        showSidebar: true,
    },
    ideView: {
        sideBarPanels: {},
        openDocuments: [],
        activeDocumentIndex: -1,
        tools: [],
        activeTool: "command",
        activeOutputPane: "emu",
        soundMuted: false,
        fastLoad: true,
        clockMultiplier: 1,
        soundLevel: 0.8,
        savedSoundLevel: 0.8
    }
}