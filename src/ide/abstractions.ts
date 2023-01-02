import { IOutputBuffer } from "@/controls/ToolArea/abstractions";
import { PanelRenderer } from "@/core/abstractions";
import { IZ80Machine } from "@/emu/abstractions/IZ80Machine";
import { MachineController } from "@/emu/machines/controller/MachineController";
import { Unsubscribe } from "@state/redux-light";

/**
 * This type describes a document that can have a designer (code editor) associated with it
 */
export type DocumentInfo = {
    /**
     * Unique ID of the document
     */
    id: string;

    /**
     * The document name to display
     */
    name: string;

    /**
     * Optional path of the document, provided it is associated with a project explorer file
     */
    path?: string;

    /**
     * Type of the document (determines the designer or code editor to handle it)
     */
    type: string;

    /**
     * Optional programming language of the document
     */
    language?: string;

    /**
     * Is the document read-only?
     */
    isReadOnly?: boolean;
}

export type DocumentState = DocumentInfo & {
    /**
     * Signs if the document is opened as temporary (the same slot can be used for another document)
     */
    isTemporary?: boolean;

    /**
     * Document state depending on the document type
     */
    stateValue?: any;
}

/**
 * This interface defines the functions managing documents within the IDE
 */
export interface IDocumentService {
    /**
     * Opens the specified document
     * @param document Document to open
     * @param temporary Open it as temporary documents? (Default: true)
     */
    openDocument(document: DocumentInfo, temporary?: boolean): void;

    /**
     * Sets the specified document as the active one
     * @param id The ID of the active document
     */
    setActiveDocument(id: string): void;

    /**
     * Sets the specified document permanent
     * @param id The ID of the document to set permanent
     */
    setPermanent(id: string): void;

    /**
     * Closes the specified document
     * @param id 
     */
    closeDocument(id: string): void;

    /**
     * Closes all open documents
     */
    closeAllDocuments(): void;
}

/**
 * Represents the information about a tool
 */
export type ToolInfo = {
    /**
     * Unique Tool ID
     */
    id: string;

    /**
     * Name to display
     */
    name: string;

    /**
     * Is the tool visible?
     */
    visible?: boolean;
}

/**
 * Represents the information about a tool and its renderer
 */
export type ToolRendereInfo = ToolInfo & {
    /**
     * Renderer function to display the tool
     */
    renderer: PanelRenderer;

    /**
     * Renderer function to display the tool's header
     */
    headerRenderer?: PanelRenderer;
}

/**
 * Represents the state of a particular tool
 */
export type ToolState = ToolInfo & {
    /**
     * Other tool state
     */
    stateValue?: any;
}

/**
 * This type represents an output pane
 */
export type OutputPaneInfo = {
    /**
     * The ID of the output pane
     */
    id: string;

    /**
     * The name of the output pane
     */
    displayName: string;
}

/**
 * This interface defines the functions managing tools within the IDE
 */
export interface IToolService {
    /**
     * Gets all available tools
     */
    getTools(): ToolRendereInfo[];

    /**
     * Gets the visible tools
     */
    getVisibleTools(): ToolRendereInfo[];
}

/**
 * This function type represents the event handler when a machine type is changing
 */
export type MachineTypeEventHandler = (machineId: string) => void;

/**
 * This function type represents the event handler of a particular machine intance
 */
export type MachineInstanceEventHandler = (machine: IZ80Machine) => void;

/**
 * This type stores information about a particular emulated machine
 */
export type MachineInfo = {
    /**
     * The ID of the machine
     */
    machineId: string;

    /**
     * The friendly name of the machine to display
     */
    displayName: string;

    /**
     * Creates the emulate machine instance
     * @returns The emulated machine instance
     */
    factory: () => IZ80Machine;
}

/**
 * This interface defines the functions managing the emulated machines within the IDE
 */
export interface IMachineService {
    /**
     * Sets the machine to to the specified one
     * @param machineId ID of the machine type to set
     */
    setMachineType(machineId: string): Promise<void>;

    /**
     * Gets the current machine type
     */
    getMachineType(): string | undefined;

    /**
     * Gets descriptive information about the current machine
     */
    getMachineInfo(): MachineInfo | undefined;

    /**
     * Gets the current machine controller instance
     */
    getMachineController(): MachineController | undefined;

    /**
     * Subscribes to an event when the old machine type is about to being disposed
     * @param handler Function handling machine type change
     * @returns An unsubscribe function
     */
    oldMachineTypeDisposing(handler: MachineTypeEventHandler): Unsubscribe;

    /**
     * Subscribes to an event when the old machine type has been disposed
     * @param handler Function handling machine type change
     * @returns An unsubscribe function
     */
    oldMachineTypeDisposed(handler: MachineTypeEventHandler): Unsubscribe;

    /**
     * Subscribes to an event when the new machine type is about to being initialized
     * @param handler Function handling machine type change
     * @returns An unsubscribe function
     */
    newMachineTypeInitializing(handler: MachineInstanceEventHandler): Unsubscribe;

    /**
     * Subscribes to an event when the new machine type have been initialized
     * @param handler Function handling machine type change
     * @returns An unsubscribe function
     */
    newMachineTypeInitialized(handler: MachineInstanceEventHandler): Unsubscribe;
}

/**
 * This interface defines the functions managing the output panes within the IDE
 */
export interface IOutputPaneService {
    /**
     * Retrieve the registered output panes
     */
    getRegisteredOutputPanes(): OutputPaneInfo[];

    /**
     * Gets an output buffer for the specified pane
     * @param id ID of the output pane
     */
    getOutputPaneBuffer(id: string): IOutputBuffer;
}

/**
 * This interface defines the functions managing the interactive commands within the IDE
 */
export interface IInteractiveCommandService {
    /**
     * Gets the output buffer of the interactive commands
     */
    getBuffer(): IOutputBuffer;
}

/**
 * This type defines the services the IDE provides
 */
export type AppServices = {
    documentService: IDocumentService;
    machineService: IMachineService;
    outputPaneService: IOutputPaneService;
    interactiveCommandsService: IInteractiveCommandService;
}