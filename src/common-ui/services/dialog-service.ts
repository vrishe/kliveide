import { IDialogService } from "@abstractions/dialog-service";
import { getSite } from "@abstractions/process-site";
import {
  sendFromEmuToMain,
  sendFromIdeToEmu,
} from "@core/messaging/message-sending";
import { ShowMessageBoxRequest } from "@core/messaging/message-types";

/**
 * This class implements the operations that show an Electron dialog
 * invoked from any of the renderer processes
 */
 export class DialogService implements IDialogService {
  /**
   * Displays a dialog message
   * @param process Renderer process to display the dialog in
   * @param message Dialog message
   * @param title Dialog title
   */
  async showMessageBox(message: string, title?: string, type?: ("info" | "error")): Promise<void> {
    const site = getSite();
    const request: ShowMessageBoxRequest = {
      type: "ShowMessageBox",
      process: site,
      message,
      title,
      asError: type === "error"
    };
    if (site === "emu") {
      await sendFromEmuToMain(request);
    } else {
      await sendFromIdeToEmu(request);
    }
  }
}
