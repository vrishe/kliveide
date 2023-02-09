import { BreakpointInfo } from "@/emu/abstractions/ExecutionContext";
import { SysVar } from "@/emu/abstractions/SysVar";
import { MessageBase } from "./messages-core";

/**
 * The main process signs that the emulator should change to a new emulated machine type
 */
export interface EmuSetMachineTypeRequest extends MessageBase {
  type: "EmuSetMachineType";
  machineId: string;
}

/**
 * Available machine commands
 */
export type MachineCommand =
  | "start"
  | "pause"
  | "stop"
  | "restart"
  | "debug"
  | "stepInto"
  | "stepOver"
  | "stepOut"
  | "rewind";

/**
 * The main process sends a machine command to the emulator
 */
export interface EmuMachineCommandRequest extends MessageBase {
  type: "EmuMachineCommand";
  command: MachineCommand;
}

/**
 * The main process sends a tape file to the emulator
 */
export interface EmuSetTapeFileRequest extends MessageBase {
  type: "EmuSetTapeFile";
  file: string;
  contents: Uint8Array;
}

/**
 * The Ide process asks the emu process for CPU state information
 */
export interface EmuGetCpuStateRequest extends MessageBase {
  type: "EmuGetCpuState";
}

/**
 * The Ide process asks the emu process for ULA state information
 */
export interface EmuGetUlaStateRequest extends MessageBase {
  type: "EmuGetUlaState";
}

export interface EmuEraseAllBreakpointsRequest extends MessageBase {
  type: "EmuEraseAllBreakpoints";
}

export interface EmuSetBreakpointRequest extends MessageBase {
  type: "EmuSetBreakpoint";
  bp: number;
}

export interface EmuRemoveBreakpointRequest extends MessageBase {
  type: "EmuRemoveBreakpoint";
  bp: number;
}

export interface EmuListBreakpointsRequest extends MessageBase {
  type: "EmuListBreakpoints";
}

export interface EmuEnableBreakpointRequest extends MessageBase {
  type: "EmuEnableBreakpoint";
  address: number;
  enable: boolean;
}

export interface EmuGetMemoryRequest extends MessageBase {
  type: "EmuGetMemory";
}

export interface EmuGetSysVarsRequest extends MessageBase {
  type: "EmuGetSysVars";
}

/**
 * The Emu process sends back CPU state information
 */
export interface EmuGetCpuStateResponse extends MessageBase {
  type: "EmuGetCpuStateResponse";
  af: number;
  bc: number;
  de: number;
  hl: number;
  af_: number;
  bc_: number;
  de_: number;
  hl_: number;
  pc: number;
  sp: number;
  ix: number;
  iy: number;
  ir: number;
  wz: number;
  tacts: number;
  tactsAtLastStart: number;
  interruptMode: number;
  iff1: boolean;
  iff2: boolean;
  sigINT: boolean;
  halted: boolean;
}

/**
 * The Emu process sends back CPU state information
 */
export interface EmuGetUlaStateResponse extends MessageBase {
  type: "EmuGetUlaStateResponse";
  fcl: number;
  frm: number;
  ras: number;
  pos: number;
  pix: string;
  bor: string;
  flo: number;
  con: number;
  lco: number;
  ear: boolean;
  mic: boolean;
  keyLines: number[];
}

/**
 * The Emu process sends back CPU state information
 */
export interface EmuListBreakpointsResponse extends MessageBase {
  type: "EmuListBreakpointsResponse";
  breakpoints: BreakpointInfo[];
  memorySegments?: number[][];
}

export interface EmuGetMemoryResponse extends MessageBase {
  type: "EmuGetMemoryResponse";
  memory: Uint8Array;
  pc: number;
  af: number;
  bc: number;
  de: number;
  hl: number;
  af_: number;
  bc_: number;
  de_: number;
  hl_: number;
  sp: number;
  ix: number;
  iy: number;
  ir: number;
  wz: number;
  osInitialized: boolean;
  memBreakpoints: BreakpointInfo[];
}

export interface EmuGetSysVarsResponse extends MessageBase {
  type: "EmuGetSysVarsResponse";
  sysVars: SysVar[];
}


export function createMachineCommand (
  command: MachineCommand
): EmuMachineCommandRequest {
  return {
    type: "EmuMachineCommand",
    command
  };
}
