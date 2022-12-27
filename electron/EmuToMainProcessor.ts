import { 
    binaryContentsResponse, 
    defaultResponse, 
    errorResponse, 
    RequestMessage, 
    ResponseMessage, 
    textContentsResponse 
} from "../common/messaging/message-types";
import { mainStore } from "./main-store";
import * as path from "path";
import * as fs from "fs";

/**
 * Process the messages coming from the emulator to the main process
 * @param message Emulator message
 * @returns Message response
 */
export async function processEmuToMainMessages(
    message: RequestMessage
): Promise<ResponseMessage> {
    switch (message.type) {
        case "ForwardAction":
            // --- The emu sent a state change action. Replay it in the main store without formarding it
            mainStore.dispatch(message.action, false);
            return defaultResponse();
        
        case "MainReadTextFile":
            // --- A client want to read the contents of a text file
            try {
                const contents = fs.readFileSync(resolvePublicFilePath(message.path), {
                    encoding: (message.encoding ?? "utf8") as BufferEncoding
                });
                return textContentsResponse(contents)
            } catch (err) {
                return errorResponse(err.toString());
            }

        case "MainReadBinaryFile":
            // --- A client want to read the contents of a binary file
            try {
                const contents = fs.readFileSync(resolvePublicFilePath(message.path));
                return binaryContentsResponse(contents)
            } catch (err) {
                return errorResponse(err.toString());
            }
    }
    return defaultResponse();
}

/**
 * Resolves the specified path using the public folder as relative root
 * @param toResolve Path to resolve
 * @returns Resolved path
 */
function resolvePublicFilePath(toResolve: string): string {
    return path.isAbsolute(toResolve)
        ? toResolve
        : path.join(process.env.PUBLIC, toResolve);
}