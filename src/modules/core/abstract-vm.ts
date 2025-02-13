import { ProgramCounterInfo } from "@state/AppState";
import { KeyMapping } from "./keyboard";
import { MemoryHelper } from "@modules-core/memory-helpers";
import {
  EXEC_ENGINE_STATE_BUFFER,
  EXEC_OPTIONS_BUFFER,
} from "@modules-core/wa-memory-map";
import {
  ExecuteCycleOptions,
  MachineCoreState,
  MachineCreationOptions,
  MachineState,
} from "@abstractions/vm-core-types";
import { ICpu, WasmCpuApi } from "@modules-core/abstract-cpu";
import {
  BreakpointDefinition,
  CodeToInject,
} from "@abstractions/code-runner-service";
import { getEngineDependencyRegistry } from "./vm-engine-dependency-registry";
import { IAudioRenderer } from "./audio/IAudioRenderer";
import { IVmEngineService } from "./vm-engine-service";

/**
 * ID of a WebAssembly module loader
 */
 export const WA_MODULE_LOADER_ID = "WaModuleLoader";

 /**
  * ID of an audio sample rate getter
  */
 export const AUDIO_SAMPLE_RATE_GETTER_ID = "AudioSampleRateGetter";
 
 /**
  * ID of an audio renderer factory
  */
 export const AUDIO_RENDERER_FACTORY_ID = "AudioRendereFactory";
 
 /**
  * Represents a function that loads a module from the its file
  */
 export type WaModuleLoader = {
   loadWaContents: (moduleFile: string) => Promise<ArrayBuffer>;
 };
 
 /**
  * A function that queries the audio sample rate
  */
 export type AudioSampleRateGetter = { getAudioSampleRate: () => number };
 
 /**
  * A factory function that creates an audio renderer
  */
 export type AudioRendererFactory = {
   createAudioRenderer: (s: number) => IAudioRenderer;
 };

 

/**
 * Represents the core abstraction of a virtual machine.
 *
 * Provides all operations that implements the machine execution
 * loop.
 */
export abstract class VirtualMachineCoreBase<T extends ICpu = ICpu> {
  private _coreState: MachineCoreState;

  /**
   * The controller instance this machine uses
   */
  protected controller: IVmEngineService;

  /**
   * The WA machine API to use the machine core
   */
  public api: WasmMachineApi;

  /**
   * Gets the CPU of the virtual machine
   */
  public abstract get cpu(): T;

  /**
   * The initial state of the machine after setup
   */
  protected initialState: MachineState;

  /**
   * Instantiates a core with the specified options
   * @param options Options to use with machine creation
   */
  constructor(public readonly options: MachineCreationOptions) {
    this._coreState = MachineCoreState.WaitForSetup;
  }

  /**
   * Attaches this machine core to a controller
   * @param controller Controller instance
   */
  attachToController(controller: IVmEngineService): void {
    this.controller = controller;
  }

  /**
   * Gets the unique model identifier of the machine
   */
  abstract getModelId(): string;

  /**
   * Friendly name to display
   */
  abstract readonly displayName: string;

  /**
   * The name of the module file with the WA machine engine
   */
  abstract readonly waModuleFile: string;

  /**
   * Optional import properties for the WebAssembly engine
   */
  readonly waImportProps: Record<string, any> = {};

  /**
   * Override this property to apply multiple engine loops before
   * Refreshing the UI.
   */
  readonly engineLoops: number = 1;

  /**
   * Width of the screen to display
   */
  get screenWidth(): number {
    return this.initialState.screenWidth;
  }

  /**
   * Height of the screen to display
   */
  get screenHeight(): number {
    return this.initialState.screenHeight;
  }

  /**
   * Gets the virtual WA memory address of the beginning of the firmware
   */
  getFirmwareBaseAddress(): number {
    return 0;
  }

  /**
   * The current state of the machine core
   */
  get coreState(): MachineCoreState {
    return this._coreState;
  }

  /**
   * Get the type of the keyboard to display
   */
  readonly keyboardType: string | null = null;

  /**
   * Gets the program counter information of the machine
   * @param state Current machine state
   */
  abstract getProgramCounterInfo(state: MachineState): ProgramCounterInfo;

  /**
   * Sets up the machine with the specified options
   *
   * Sets the core state to `Configured`
   */
  async setupMachine(): Promise<void> {
    // --- Prepare the firmware
    let firmware: Uint8Array[] = [];
    if (this.options.firmware) {
      firmware = this.options.firmware;
    } else {
      throw new Error("No firmware specified.");
    }

    // --- Create the webassembly module
    const waImportObject = {
      imports: {
        trace: (arg: number) => console.log(arg),
        ...this.waImportProps,
      },
    };

    const modelId = this.getModelId();
    const waLoader = getEngineDependencyRegistry().getComponent(
      modelId,
      WA_MODULE_LOADER_ID
    ) as unknown as WaModuleLoader;
    if (!waLoader) {
      throw new Error(
        `No WebAssembly loader registered for machine type ${modelId}`
      );
    }
    this.api = (
      await WebAssembly.instantiate(
        await waLoader.loadWaContents(this.waModuleFile),
        waImportObject
      )
    ).instance.exports as unknown as WasmMachineApi;
    if (!this.api) {
      throw new Error("WebAssembly module initialization failed.");
    }

    // --- Prepare the machine to run
    this.api.setupMachine();
    this.configureMachine();
    this.initFirmware(firmware);

    // --- Obtain the initial screen dimensions
    this.initialState = this.getMachineState();

    // --- Done.
    this._coreState = MachineCoreState.Configured;
  }

  /**
   * Override this method to configure the virtual machine before turning it on
   */
  configureMachine(): void {}

  /**
   * Initializes the specified ROMs
   * @param firmware Optional buffers with ROM contents
   */
  initFirmware(firmware?: Uint8Array[]): void {
    if (!firmware) {
      return;
    }
    const mh = new MemoryHelper(this.api, this.getFirmwareBaseAddress());
    for (let i = 0; i < firmware.length; i++) {
      const rom = firmware[i];
      for (let j = 0; j < rom.length; j++) {
        mh.writeByte(0x4000 * i + j, rom[j]);
      }
    }
  }

  /**
   * Executes the hard reset, as if the nachine has been turned
   * off, and then tuned on. Clears volatile memory.
   */
  turnOn(): void {
    // TODO: Implement this method
  }

  /**
   * Executes soft reset. Uses the hardware's reset signal, generally
   * keeps the state of the volatile memory.
   */
  reset(): void {
    // TODO: Implement this method
  }

  /**
   * Represents the state of the machine, including the CPU, memory, and machine
   * devices
   */
  getMachineState(): MachineState {
    const s: MachineState = {} as MachineState;
    // --- Get execution engine state
    this.api.getExecutionEngineState();
    const mh = new MemoryHelper(this.api, EXEC_ENGINE_STATE_BUFFER);
    s.frameCount = mh.readUint32(0);
    s.frameCompleted = mh.readBool(4);
    s.lastRenderedFrameTact = mh.readUint32(5);
    s.executionCompletionReason = mh.readUint32(9);

    return s;
  }

  /**
   * Gets the addressable memory contents from the machine
   */
  abstract getMemoryContents(): Uint8Array;

  /**
   * Handles pressing or releasing a physical key on the keyboard
   * @param keycode Virtual keycode
   * @param isDown Is the key pressed down?
   */
  handlePhysicalKey(keycode: string, isDown: boolean): void {
    const keyMapping = this.getKeyMapping();
    const keySet = keyMapping[keycode];
    if (!keySet) {
      // --- No mapping for the specified physical key
      return;
    }

    if (typeof keySet === "string") {
      // --- Single key
      const resolved = this.resolveKeyCode(keySet);
      if (resolved !== null) {
        this.setKeyStatus(resolved, isDown);
      }
    } else {
      for (const key of keySet) {
        const resolved = this.resolveKeyCode(key);
        if (resolved !== null) {
          this.setKeyStatus(resolved, isDown);
        }
      }
    }
  }

  /**
   * Gets the key mapping used by the machine
   */
  getKeyMapping(): KeyMapping {
    return {};
  }

  /**
   * Resolves a string key code to a key number
   * @param code Key code to resolve
   */
  resolveKeyCode(code: string): number | null {
    return null;
  }

  /**
   * Sets the status of the specified key on the keyboard
   * @param key Code of the key
   * @param isDown Pressed/released status of the key
   */
  setKeyStatus(key: number, isDown: boolean): void {
    this.api.setKeyStatus(key, isDown);
  }

  /**
   * Sets the audio sample rate to use with sound devices
   * @param rate Audio sampe rate to use
   */
  setAudioSampleRate(rate: number): void {}

  /**
   * Gets the screen pixels data to display
   */
  getScreenData(): Uint32Array {
    return new Uint32Array(0);
  }

  /**
   * Override this method to determine the length of the subsequent CPU instruction
   * @returns The length of the next instruction
   */
  getNextInstructionAddress(): number {
    return 0;
  }

  /**
   * Reads a byte from the memory
   * @param addr Memory address
   */
  abstract readMemory(addr: number): number;

  /**
   * Writes a byte into the memory
   * @param addr Memory address
   * @param value Value to write
   */
  abstract writeMemory(addr: number, value: number): void;

  /**
   * The currently set execution options
   */
  executionOptions: ExecuteCycleOptions | null;

  /**
   * Executes a single machine frame
   * @param options Execution options
   */
  executeFrame(options: ExecuteCycleOptions): void {
    this.executionOptions = options;

    // --- Copy execution options
    const mh = new MemoryHelper(this.api, EXEC_OPTIONS_BUFFER);
    mh.writeByte(0, options.emulationMode);
    mh.writeByte(1, options.debugStepMode);
    mh.writeBool(2, false);
    mh.writeByte(3, options.terminationPartition);
    mh.writeUint16(4, options.terminationAddress);
    mh.writeBool(6, false);
    mh.writeBool(7, false);
    mh.writeUint32(8, options.stepOverBreakpoint);
    this.api.setExecutionOptions();

    // --- Run the cycle and retrieve state
    this.api.executeMachineLoop();
  }

  /**
   * Executes a machine specific command. Override in a machine to
   * respond to those commands
   * @param _command Command to execute
   * @param _args: Optional command arguments
   */
  async executeMachineCommand(
    _command: string,
    _args?: unknown
  ): Promise<unknown> {
    return;
  }

  /**
   * Override this method to set the clock multiplier
   * @param _multiplier Clock multiplier to apply from the next frame
   */
  setClockMultiplier(_multiplier: number): void {}

  /**
   * Indicates if the virtual machine supports code injection for the specified
   * machine mode
   * @param mode Optional machine mode
   * @returns True, if the model supports the code injection
   */
  supportsCodeInjection(mode?: string): boolean {
    return false;
  }

  /**
   * Initializes the machine with the specified code
   * @param runMode Machine run mode
   * @param code Intial code
   */
  injectCode(
    code: number[],
    codeAddress = 0x8000,
    startAddress = 0x8000
  ): void {}

  /**
   * Injects the specified code into the ZX Spectrum machine
   * @param codeToInject Code to inject into the machine
   */
  abstract injectCodeToRun(codeToInject: CodeToInject): Promise<number>;

  /**
   * Prepares the engine for code injection
   * @param model Model to run in the virtual machine
   */
  abstract prepareForInjection(model: string): Promise<number>;

  /**
   * Injects the specified code into the ZX Spectrum machine and runs it
   * @param codeToInject Code to inject into the machine
   * @param debug Start in debug mode?
   */
  abstract runCode(codeToInject: CodeToInject, debug?: boolean): Promise<void>;

  /**
   * Clear all breakpoints
   */
  abstract clearBreakpoints(): Promise<void>;

  /**
   * Set the specified breakpoint definition
   * @param def
   */
  abstract setBreakpoint(def: BreakpointDefinition): Promise<void>;

  // ==========================================================================
  // Lifecycle methods

  /**
   * Override this method to define actions when the virtual machine is started
   * from stopped state
   */
  async beforeFirstStart(): Promise<void> {}

  /**
   * Override this method to define an action before the virtual machine has
   * started.
   * @param _debugging Is started in debug mode?
   */
  async beforeStarted(_debugging: boolean): Promise<void> {}

  /**
   * Override this method to define an action to run before the injected
   * code is started
   * @param _codeToInject The injected code
   * @param _debug Start in debug mode?
   */
  async beforeRunInjected(
    _codeToInject: CodeToInject,
    _debug?: boolean
  ): Promise<void> {}

  /**
   * Override this method to define an action after the virtual machine has
   * started.
   * @param _debugging Is started in debug mode?
   * @param _isFirstStart Is the machine started from stopped state?
   */
  async afterStarted(_debugging: boolean): Promise<void> {}

  /**
   * Override this action to define an action when the virtual machine
   * has paused.
   * @param _isFirstPause Is the machine paused the first time?
   */
  async onPaused(_isFirstPause: boolean): Promise<void> {}

  /**
   * Override this action to define an action when the virtual machine
   * has stopped.
   */
  async onStopped(): Promise<void> {}

  /**
   * Override this action to define an action before the step-into
   * operation is executed.
   */
  async beforeStepInto(): Promise<void> {}

  /**
   * Override this action to define an action before the step-over
   * operation is executed.
   */
  async beforeStepOver(): Promise<void> {}

  /**
   * Override this action to define an action before the step-out
   * operation is executed.
   */
  async beforeStepOut(): Promise<void> {}

  /**
   * Override this method in derived classes to define an action when
   * the machine's execution cycle has completed.
   * @param _resultState Machine state on loop completion
   */
  async onEngineCycleCompletion(_resultState: MachineState): Promise<void> {}

  /**
   * Override this method in derived classes to define an action when
   * the UI loop waits for loop state evaluations (whether to continue the
   * cycle of not).
   * @param _resultState Machine state on loop completion
   */
  async beforeEvalLoopCompletion(_resultState: MachineState): Promise<void> {}

  /**
   * Override this method to define an action when the execution cycle has
   * completed after the loop evaluation.
   * @param _resultState Machine state on cycle completion
   */
  async onExecutionCycleCompleted(_resultState: MachineState): Promise<void> {}

  /**
   * Override this method to define an action when an entire frame has been
   * completed within the machine execution cycle.
   * @param _resultState Machine state on frame completion
   * @param _toWait Number of milliseconds to wait for the next frame
   */
  async onFrameCompleted(
    _resultState: MachineState,
    _toWait: number
  ): Promise<void> {}
}

/**
 * This interface defines an object that can contribute in a virtual machines
 * lifecycle
 */
export interface IMachineComponentProvider {
  /**
   * ID of the provider object
   */
  readonly id: string;
}

/**
 * Represents the Machine API
 */
export interface WasmMachineApi extends WasmCpuApi {
  // --- Virtual machine methods
  setupMachine(): void;
  resetMachine(): void;
  getMachineState(): void;
  getExecutionEngineState(): void;
  setExecutionOptions(): void;
  executeMachineLoop(): void;
  setKeyStatus(key: number, isDown: boolean): void;
  getKeyStatus(key: number): number;

  // --- Z88 machine methods
  testIncZ88Rtc(inc: number): void;
  testSetRtcRegs(
    tim0: number,
    tim1: number,
    tim2: number,
    tim3: number,
    tim4: number
  ): void;
  testSetZ88INT(value: number): void;
  testSetZ88STA(value: number): void;
  testSetZ88COM(value: number): void;
  testSetZ88TMK(value: number): void;
  testReadCz88Memory(addr: number): number;
  testWriteCz88Memory(addr: number, value: number): number;
  setZ88ChipMask(slot: number, value: number): void;
  setZ88SlotMask(slot: number, isRom: boolean): void;
  setZ88RndSeed(seed: number): void;
  writePortCz88(addr: number, value: number): void;
  clearMemory(): void;
  setZ88ScreenSize(scw: number, sch: number): void;
  raiseBatteryLow(): void;
}
