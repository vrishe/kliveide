import { IModalDialogDescriptor, IModalDialogService } from "@abstractions/modal-dialog-service";
import { displayModalAction } from "@state/modal-reducer";
import { ILiteEvent, LiteEvent } from "@core/utils/lite-event";
import { dispatch } from "@core/service-registry";

/**
 * Implements the logic that controls modal dialogs in the renderer processes
 */
 export class ModalDialogService implements IModalDialogService {
  private _descriptors = new Map<string, IModalDialogDescriptor>();
  private _modalDescriptor: IModalDialogDescriptor | null = null;
  private _modalChanged = new LiteEvent<IModalDialogDescriptor | null>();
  private _visible = false;
  private _visibilityChanged = new LiteEvent<boolean>();
  private _dialogResolver: (result?: unknown | PromiseLike<unknown>) => void;
  private _args: unknown;
  private _result: unknown;

  /**
   * Gets the current modal descriptor
   */
  get modalDescriptor(): IModalDialogDescriptor {
    return this._modalDescriptor;
  }

  /**
   * Gets the arguments of the modal dialog
   */
  get args(): unknown {
    return this._args;
  }

  /**
   * Gets the results of the modal dialog
   */
  get result(): unknown {
    return this._result;
  }

  /**
   * Registers a modal descriptor
   * @param id Descriptor identifier
   * @param descriptor Modial dialog descriptor
   */
  registerModalDescriptor(id: string, descriptor: IModalDialogDescriptor): void {
    this._descriptors.set(id, descriptor);
  }

  /**
   * Disposes the modal dialog
   */
  disposeModalDialog(): void {
    this._modalDescriptor = null;
  }

  /**
   * Displays the current modal dialog
   */
  hide(result?: unknown): void {
    if (!this._visible) {
      return;
    }
    dispatch(displayModalAction(false));
    this._result = result;
    this._visible = false;
    this._visibilityChanged.fire(false);
    this._dialogResolver(result);
  }

  /**
   * Displays the specified modal dialog
   * @param id Modal dialog identifier
   * @param args Optional dialog arguments
   * @returns The result of the modal dialog
   */
  async showModalDialog(id: string, args?: unknown): Promise<unknown> {
    if (this._visible) {
      return;
    }
    const descriptor = this._descriptors.get(id);
    if (!descriptor) {
      throw new Error(`Unregistered modal dialog: '${id}'`)
    }
    this._modalDescriptor = descriptor;
    this._args = args;
    dispatch(displayModalAction(true));
    this._modalChanged.fire(descriptor);
    this._visible = true;
    this._visibilityChanged.fire(true);
    return new Promise<unknown>((resolve) => {
      this._dialogResolver = resolve;
    });
  }

  /**
   * This event signs that the modal dialog has changed
   */
  get modalChanged(): ILiteEvent<IModalDialogDescriptor | null> {
    return this._modalChanged;
  }

  /**
   * This event signs that the visibility of the modal dialog has changed
   */
  get visibilityChanged(): ILiteEvent<boolean> {
    return this._visibilityChanged;
  }
}
