/**
 * Available action types
 */
export interface ActionTypes {
  UNLOAD_WINDOWS: null;
  EMU_LOADED: null;
  EMU_STATE_SYNCHED: null,
  IDE_LOADED: null;
  IDE_STATE_SYNCHED: null,
  IS_WINDOWS: null;
  SET_THEME: null;
  IDE_FOCUSED: null,
  EMU_FOCUSED: null,
  DIM_MENU: null,

  SHOW_EMU_TOOLBAR: null;
  SHOW_EMU_STATUSBAR: null;
  SHOW_IDE_TOOLBAR: null;
  SHOW_IDE_STATUSBAR: null;
  SHOW_TOOL_PANELS: null;
  SHOW_KEYBOARD: null;
  SHOW_FRAME_INFO: null;

  SHOW_SIDE_BAR: null;
  PRIMARY_BAR_ON_RIGHT: null;
  TOOLS_ON_TOP: null;
  MAXIMIZE_TOOLS: null;

  SET_ACTIVITY: null;
  SET_SIDEBAR_PANEL_EXPANDED: null;
  SET_SIDEBAR_PANELS_STATE: null;
  SET_SIDEBAR_PANEL_SIZE: null;

  ACTIVATE_DOC: null;
  CHANGE_DOC: null;
  CREATE_DOC: null;
  CLOSE_DOC: null;
  CLOSE_ALL_DOCS: null;
  DOC_MOVE_LEFT: null;
  DOC_MOVE_RIGHT: null;

  SET_TOOLS: null;
  ACTIVATE_TOOL: null;
  CHANGE_TOOL_VISIBILITY: null;
  CHANGE_TOOL_STATE: null;

  SET_MACHINE_TYPE: null;
  SET_MACHINE_STATE: null;
  MUTE_SOUND: null;
  SET_SOUND_LEVEL: null;
  SET_FAST_LOAD: null;
  SET_CLOCK_MULTIPLIER: null;
  SET_AUDIO_SAMPLE_RATE: null;
  SET_TAPE_FILE: null;
  ACTIVATE_OUTPUT_PANE: null;

  SET_IDE_STATUS_MESSAGE: null;
  INC_BPS_VERSION: null;
  INC_TOOL_CMD_SEQ: null;

  OPEN_FOLDER: null;
  CLOSE_FOLDER: null;

  DISPLAY_DIALOG: null;
}
