import { BreakpointDefinition } from "@abstractions/code-runner-service";
import {
  addBreakpoint,
  disableBreakpoint,
  enableAllBreakpoints,
  enableBreakpoint,
  normalizeBreakpoints,
  removeBreakpoint,
  scrollBreakpoints,
} from "@abstractions/debug-helpers";
import { DebuggerState } from "./AppState";
import { ActionCreator, KliveAction } from "./state-core";

// ============================================================================
// Actions

export const clearBreakpointsAction: ActionCreator = () => ({
  type: "CLEAR_BREAKPOINTS",
});

export const addBreakpointAction: ActionCreator = (
  breakpoint: BreakpointDefinition
) => ({
  type: "ADD_BREAKPOINT",
  payload: { breakpoint },
});

export const removeBreakpointAction: ActionCreator = (
  breakpoint: BreakpointDefinition
) => ({
  type: "REMOVE_BREAKPOINT",
  payload: { breakpoint },
});

export const enableBreakpointAction: ActionCreator = (
  breakpoint: BreakpointDefinition
) => ({
  type: "ENABLE_BREAKPOINT",
  payload: { breakpoint },
});

export const disableBreakpointAction: ActionCreator = (
  breakpoint: BreakpointDefinition
) => ({
  type: "DISABLE_BREAKPOINT",
  payload: { breakpoint },
});

export const enableAllBreakpointsAction: ActionCreator = () => ({
  type: "ENABLE_ALL_BREAKPOINTS",
});

export const scrollBreakpointsAction: ActionCreator = (
  breakpoint: BreakpointDefinition,
  shift: number
) => ({
  type: "SCROLL_BREAKPOINTS",
  payload: { breakpoint, shift },
});

export const normalizeBreakpointsAction: ActionCreator = (
  resource: string,
  lineCount: number
) => ({
  type: "NORMALIZE_BREAKPOINTS",
  payload: { resource, lineCount },
});

// ============================================================================
// Reducer

const initialState: DebuggerState = {
  breakpoints: [],
};

export default function (
  state = initialState,
  { type, payload }: KliveAction
): DebuggerState {
  switch (type) {
    case "CLEAR_BREAKPOINTS":
      return {
        ...state,
        breakpoints: [],
      };
    case "ADD_BREAKPOINT":
      return {
        ...state,
        breakpoints: addBreakpoint(state.breakpoints, payload.breakpoint),
      };
    case "REMOVE_BREAKPOINT":
      return {
        ...state,
        breakpoints: removeBreakpoint(state.breakpoints, payload.breakpoint),
      };
    case "ENABLE_BREAKPOINT":
      return {
        ...state,
        breakpoints: enableBreakpoint(state.breakpoints, payload.breakpoint),
      };
    case "DISABLE_BREAKPOINT":
      return {
        ...state,
        breakpoints: disableBreakpoint(state.breakpoints, payload.breakpoint),
      };
    case "ENABLE_ALL_BREAKPOINTS":
      return {
        ...state,
        breakpoints: enableAllBreakpoints(state.breakpoints),
      };
    case "SCROLL_BREAKPOINTS":
      return {
        ...state,
        breakpoints: scrollBreakpoints(
          state.breakpoints,
          payload.breakpoint,
          payload.shift
        ),
      };
    case "NORMALIZE_BREAKPOINTS":
      return {
        ...state,
        breakpoints: normalizeBreakpoints(
          state.breakpoints,
          payload.resource,
          payload.lineCount
        ),
      };
    default:
      return state;
  }
}
