import { Action } from "./Action";
import { EmulatorState } from "./AppState";

/**
 * This reducer is used to manage the emulator view option properties
 */
export function emulatorStateReducer (
  state: EmulatorState,
  { type, payload }: Action
): EmulatorState {
  switch (type) {
    case "SET_MACHINE_TYPE":
      return { ...state, machineId: payload?.id };
    case "SET_MACHINE_STATE": {
      return {
        ...state,
        machineState: payload.state
      };
    }
    case "MUTE_SOUND": {
      return {
        ...state,
        soundMuted: payload.flag,
        soundLevel: payload.flag ? 0.0 : state.savedSoundLevel,
        savedSoundLevel: payload.flag ? state.soundLevel : state.savedSoundLevel
      };
    }

    case "SET_SOUND_LEVEL": {
      return {
        ...state,
        soundLevel: payload.numValue,
        soundMuted: payload.numValue === 0.0,
        savedSoundLevel:
          payload.numValue === 0.0 ? state.soundLevel : payload.numValue
      };
    }

    case "SET_FAST_LOAD": {
      return {
        ...state,
        fastLoad: payload.flag
      };
    }

    case "SET_CLOCK_MULTIPLIER": {
      return {
        ...state,
        clockMultiplier: payload.numValue
      };
    }

    case "SET_AUDIO_SAMPLE_RATE": {
      return {
        ...state,
        audioSampleRate: payload.numValue
      };
    }

    case "SET_TAPE_FILE": {
      return {
        ...state,
        tapeFile: payload.file
      };
    }

    default:
      return state;
  }
}
