import { getState } from "@abstractions/service-helpers";
import { ICambridgeZ88StateManager } from "./ICambrideZ88StateMananger";

export class CambridgeZ88StateManager implements ICambridgeZ88StateManager {
  /**
   * Gets the current state
   */
  getState(): any {
    return getState();
  }
}
