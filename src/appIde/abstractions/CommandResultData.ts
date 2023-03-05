import { OutputContentLine } from "../ToolArea/abstractions";

/**
 * Represents the data passed to a command result documents
 */
export type CommandResultData = {
  title: string;
  lines: OutputContentLine[];
  bufferText: string;
};
