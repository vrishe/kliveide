/**
 * Available action types
 */
export interface ActionTypes {
  EMU_UI_LOADED: null;
  IDE_UI_LOADED: null;

  SET_THEME: null;

  EMU_SHOW_TOOLBAR: null;
  EMU_HIDE_TOOLBAR: null;
  EMU_SHOW_STATUSBAR: null;
  EMU_HIDE_STATUSBAR: null;
  EMU_SHOW_KEYBOARD: null;
  EMU_HIDE_KEYBOARD: null;
  EMU_SHOW_FRAME_INFO: null;
  EMU_HIDE_FRAME_INFO: null;

  EMU_SET_MACINE_TYPE: null;

  // --- Emulator panel actions
  EMU_SET_SIZE: null;
  EMU_SET_EXEC_STATE: null;
  EMU_SET_FRAME_ID: null;
  EMU_MUTE: null;
  EMU_UNMUTE: null;
  EMU_SET_DEBUG: null;
  EMU_SET_MESSAGE: null;
  EMU_SET_SOUND_LEVEL: null;
  EMU_SET_CLOCK_MULTIPLIER: null;
  EMU_SET_KEYBOARD: null;
  EMU_MACHINE_CONTEXT: null;
  EMU_KEYBOARD_HEIGHT: null;
  EMU_SET_FIRMWARE: null;

  // --- ZX Spectrum specific action
  SPECTRUM_FAST_LOAD: null;
  SPECTRUM_BEAM_POSITION: null;
  SPECTRUM_TAPE_CONTENTS: null;
}
