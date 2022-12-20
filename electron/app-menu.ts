import { 
    app, 
    BrowserWindow, 
    Menu, 
    MenuItem, 
    MenuItemConstructorOptions 
} from "electron";
import { __DARWIN__ } from "./electron-utils";
import { mainStore } from "./main-store";
import { 
    showStatusBarAction, 
    showToolbarAction, 
    primaryBarOnRightAction, 
    showSideBarAction, 
    useEmuViewAction, 
    showToolPanelsAction,
    toolPanelsOnTopAction,
    maximizeToolsAction,
    setThemeAction,
    changeToolVisibilityAction} from "../common/state/actions";

const TOGGLE_DEVTOOLS = "toggle_devtools";
const TOGGLE_SIDE_BAR = "toggle_side_bar";
const TOGGLE_TOOLBAR = "toggle_toolbar";
const TOGGLE_PRIMARY_BAR_RIGHT = "primary_side_bar_right"
const TOGGLE_STATUS_BAR = "toggle_status_bar";
const SET_EMULATOR_VIEW = "set_emulator_view";
const SET_IDE_VIEW = "set_ide_view";
const TOGGLE_TOOL_PANELS = "toggle_tool_panels";
const TOGGLE_TOOLS_TOP = "tool_panels_top";
const MAXIMIZE_TOOLS = "tools_maximize";
const TOOL_PREFIX = "tool_panel_";
const THEMES = "themes";
const LIGHT_THEME = "light_theme";
const DARK_THEME = "dark_theme";

/**
 * Creates and sets the main menu of the app
 */
export function setupMenu(): void {
    const template: (MenuItemConstructorOptions | MenuItem)[] = [];
    const appState = mainStore.getState();
    const tools = appState.ideView?.tools ?? [];

    /**
     * Application system menu on MacOS
     */
    if (__DARWIN__) {
        template.push({
            label: app.name,
            submenu: [
                { role: "about" },
                { type: "separator" },
                { role: "services" },
                { type: "separator" },
                { role: "hide" },
                { role: "hideOthers" },
                { role: "unhide" },
                { type: "separator" },
                { role: "quit" },
            ],
        });
    }

    /**
     * Edit menu on MacOS
     */
    if (__DARWIN__) {
        template.push({
            label: 'Edit',
            submenu: [
                {role: 'undo'},
                {role: 'redo'},
                {type: 'separator'},
                {role: 'cut'},
                {role: 'copy'},
                {role: 'paste'},
                {role: 'pasteAndMatchStyle'},
                {role: 'delete'},
                {role: 'selectAll'}
            ]
        })
    }

    const toolMenus: MenuItemConstructorOptions[] = tools.map(t => {
        return {
            id: `${TOOL_PREFIX}${t.id}`,
            label: `Show ${t.name} Panel`,
            type: "checkbox",
            checked: t.visible,
            enabled: !appState.emuViewOptions.useEmuView,
            click: (mi) => {
                const panelId = mi.id.substring(TOOL_PREFIX.length);
                mainStore.dispatch(changeToolVisibilityAction(panelId, mi.checked))
            }
        }
    });

    // --- Preapre the view menu
    const viewSubMenu: MenuItemConstructorOptions[] = [
        { role: "resetZoom" },
        { role: "zoomIn" },
        { role: "zoomOut" },
        { type: "separator" },
        { role: "togglefullscreen" },
        {
            id: TOGGLE_DEVTOOLS,
            label: "Toggle Developer Tools",
            accelerator: "Ctrl+Shift+I",
            click: () => {
                BrowserWindow.getFocusedWindow().webContents.toggleDevTools();
            },
        },
        { type: "separator" },
        {
            id: THEMES,
            label: "Themes",
            submenu: [
                {
                    id: LIGHT_THEME,
                    label: "Light",
                    type: "checkbox",
                    checked: appState.theme === "light",
                    click: () => {
                        mainStore.dispatch(setThemeAction("light"));
                    },
                },
                {
                    id: DARK_THEME,
                    label: "Dark",
                    type: "checkbox",
                    checked: appState.theme === "dark",
                    click: () => {
                        mainStore.dispatch(setThemeAction("dark"));
                    },
                },
            ]
        },
        { type: "separator" },
        {
            id: TOGGLE_TOOLBAR,
            label: "Show the Toolbar",
            type: "checkbox",
            checked: appState.emuViewOptions.showToolbar,
            click: (mi) => {
                mainStore.dispatch(showToolbarAction(mi.checked));
            },
        },
        {
            id: TOGGLE_STATUS_BAR,
            label: "Show the Status Bar",
            type: "checkbox",
            checked: appState.emuViewOptions.showStatusBar,
            click: (mi) => {
                mainStore.dispatch(showStatusBarAction(mi.checked));
            },
        },
        { type: "separator" },
        {
            id: SET_EMULATOR_VIEW,
            label: "Use the Emulator view",
            type: "checkbox",
            checked: appState.emuViewOptions.useEmuView,
            click: (mi) => {
                mi.checked = true;
                Menu.getApplicationMenu().getMenuItemById(SET_IDE_VIEW).checked = false;
                mainStore.dispatch(useEmuViewAction(true));
            },
        },
        {
            id: SET_IDE_VIEW,
            label: "Use the IDE view",
            type: "checkbox",
            checked: !appState.emuViewOptions.useEmuView,
            click: (mi) => {
                mi.checked = true;
                Menu.getApplicationMenu().getMenuItemById(SET_EMULATOR_VIEW).checked = false;
                mainStore.dispatch(useEmuViewAction(false));
            },
        },
        { type: "separator" },
        {
            id: TOGGLE_SIDE_BAR,
            label: "Show the Side Bar",
            type: "checkbox",
            checked: appState.emuViewOptions.showStatusBar,
            enabled: !appState.emuViewOptions.useEmuView,
            click: (mi) => {
                mainStore.dispatch(showSideBarAction(mi.checked));
            },
        },
        {
            id: TOGGLE_PRIMARY_BAR_RIGHT,
            label: "Move Primary Side Bar Right",
            type: "checkbox",
            checked: appState.emuViewOptions.primaryBarOnRight,
            enabled: !appState.emuViewOptions.useEmuView,
            click: (mi) => {
                mainStore.dispatch(primaryBarOnRightAction(mi.checked));
            },
        },
        {
            id: TOGGLE_TOOL_PANELS,
            label: "Show Tool Panels",
            type: "checkbox",
            checked: appState.emuViewOptions.showToolPanels,
            enabled: !appState.emuViewOptions.useEmuView,
            click: (mi) => {
                const checked = mi.checked;
                mainStore.dispatch(showToolPanelsAction(checked));
                if (checked) {
                    mainStore.dispatch(maximizeToolsAction(false));
                }
            },
        },
        {
            id: TOGGLE_TOOLS_TOP,
            label: "Move Tool Panels Top",
            type: "checkbox",
            checked: appState.emuViewOptions.toolPanelsOnTop,
            enabled: !appState.emuViewOptions.useEmuView,
            click: (mi) => {
                mainStore.dispatch(toolPanelsOnTopAction(mi.checked));
            },
        },
        {
            id: MAXIMIZE_TOOLS,
            label: "Maximize Tool Panels",
            type: "checkbox",
            checked: appState.emuViewOptions.maximizeTools,
            enabled: !appState.emuViewOptions.useEmuView,
            click: (mi) => {
                const checked = mi.checked;
                if (checked) {
                    mainStore.dispatch(showToolPanelsAction(true));
                }
                mainStore.dispatch(maximizeToolsAction(checked));
            },
        },
        { type: "separator" },
        ...toolMenus
    ];

    template.push({
        label: "View",
        submenu: viewSubMenu,
    });

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
}

/**
 * Update the state of menu items whenver the app state changes.
 */
export function updateMenuState(): void {
    setupMenu();
    
    const appState = mainStore.getState();
    const getMenuItem = (id: string) => Menu.getApplicationMenu().getMenuItemById(id);

    // --- Disable IDE-related items in EMU mode
    const enableIdeMenus = !appState.emuViewOptions.useEmuView;
    getMenuItem(TOGGLE_PRIMARY_BAR_RIGHT).enabled = enableIdeMenus;
    getMenuItem(TOGGLE_PRIMARY_BAR_RIGHT).checked = appState.emuViewOptions.primaryBarOnRight;
    getMenuItem(TOGGLE_SIDE_BAR).enabled = enableIdeMenus;
    getMenuItem(TOGGLE_SIDE_BAR).checked = appState.emuViewOptions.showSidebar;
    getMenuItem(TOGGLE_TOOL_PANELS).enabled = enableIdeMenus;
    getMenuItem(TOGGLE_TOOL_PANELS).checked = appState.emuViewOptions.showToolPanels;
    getMenuItem(TOGGLE_TOOLS_TOP).enabled = enableIdeMenus;
    getMenuItem(TOGGLE_TOOLS_TOP).checked = appState.emuViewOptions.toolPanelsOnTop;
    getMenuItem(MAXIMIZE_TOOLS).enabled = enableIdeMenus;
    getMenuItem(MAXIMIZE_TOOLS).checked = appState.emuViewOptions.maximizeTools;
    getMenuItem(LIGHT_THEME).checked = appState.theme === "light";
    getMenuItem(DARK_THEME).checked = appState.theme === "dark";
}
