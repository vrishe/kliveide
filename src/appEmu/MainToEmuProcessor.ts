import {
  defaultResponse,
  RequestMessage,
  ResponseMessage
} from "@messaging/messages-core";
import { BinaryReader } from "@utils/BinaryReader";
import { TAPE_DATA } from "../emu/machines/machine-props";
import { TapeDataBlock } from "../emu/machines/tape/abstractions";
import { TapReader } from "../emu/machines/tape/TapReader";
import { TzxReader } from "../emu/machines/tape/TzxFileFormatLoader";
import { AppServices } from "../ide/abstractions";
import { EmuSetTapeFileRequest } from "@messaging/main-to-emu";
import { MessengerBase } from "@messaging/MessengerBase";
import { AppState } from "@state/AppState";
import { Store } from "@state/redux-light";

/**
 * Process the messages coming from the emulator to the main process
 * @param message Emulator message
 * @returns Message response
 */
export async function processMainToEmuMessages (
  message: RequestMessage,
  store: Store<AppState>,
  emuToMain: MessengerBase,
  { machineService }: AppServices
): Promise<ResponseMessage> {
  switch (message.type) {
    case "ForwardAction":
      // --- The emu sent a state change action. Replay it in the main store without formarding it
      store.dispatch(message.action, message.sourceId);
      break;

    case "EmuSetMachineType":
      // --- Change the current machine type to a new one
      await machineService.setMachineType(message.machineId);
      break;

    case "EmuMachineCommand":
      // --- Execute the specified machine command
      const controller = machineService.getMachineController();
      if (controller) {
        switch (message.command) {
          case "start":
            controller.start();
            break;
          case "pause":
            await controller.pause();
            break;
          case "stop":
            await controller.stop();
            break;
          case "restart":
            await controller.restart();
            break;
          case "debug":
            controller.startDebug();
            break;
          case "stepInto":
            await controller.stepInto();
            break;
          case "stepOver":
            await controller.stepOver();
            break;
          case "stepOut":
            await controller.stepOut();
            break;
        }
      }
      break;

    case "EmuSetTapeFile":
      await setTapeFile(message);
      break;
  }
  return defaultResponse();

  // --- Parses and sets the tape file
  async function setTapeFile (message: EmuSetTapeFileRequest): Promise<void> {
    // --- Try to read a .TZX file
    let dataBlocks: TapeDataBlock[] = [];
    const reader = new BinaryReader(message.contents);
    const tzxReader = new TzxReader(reader);
    let result = tzxReader.readContent();
    if (result) {
      reader.seek(0);
      const tapReader = new TapReader(reader);
      result = tapReader.readContent();
      if (result) {
        await emuToMain.sendMessage({
          type: "MainDisplayMessageBox",
          messageType: "error",
          title: "Tape file error",
          message: `Error while processing tape file ${message.file} (${result})`
        });
        return;
      } else {
        dataBlocks = tapReader.dataBlocks;
      }
    } else {
      dataBlocks = tzxReader.dataBlocks
        .map(b => b.getDataBlock())
        .filter(b => b);
    }

    // --- Ok, pass the tape file data blocks to the machine
    const controller = machineService.getMachineController();
    controller.machine.setMachineProperty(TAPE_DATA, dataBlocks);

    // --- Done.
    await emuToMain.sendMessage({
      type: "MainDisplayMessageBox",
      messageType: "info",
      title: "Tape file set",
      message: `Tape file ${message.file} successfully set.`
    });
  }
}
