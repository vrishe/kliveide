import * as React from "react";

import { dispatch, getState, getStore } from "@core/service-registry";

import { setSideBarStateAction } from "@state/side-bar-reducer";
import { AppState, SideBarState } from "@state/AppState";
import { ILiteEvent, LiteEvent } from "@core/utils/lite-event";
import { ISideBarPanel, ISideBarService } from "@abstractions/side-bar-service";

/**
 * The base class for all side bar panel descriptors
 */
export abstract class SideBarPanelDescriptorBase implements ISideBarPanel {
  private _panelState: Record<string, any> = {};
  private _expanded = false;
  private _expandedChanged = new LiteEvent<boolean>();

  get title(): string {
    return "(Panel)";
  }

  /**
   * Signs if the specified panel is expanded
   * @param expanded
   */
  get expanded(): boolean {
    return this._expanded;
  }
  set expanded(value: boolean) {
    if (value !== this._expanded) {
      this._expanded = value;
      this._expandedChanged.fire();
    }
  }

  /**
   * Signs if the panel is focused
   */
  focused: boolean = false;

  /**
   * The current height of the panel
   */
  height: number = -1;

  /**
   * The current percentage height of the panel. Set when the panel
   * is resized.
   */
  heightPercentage = 100;

  /**
   * Creates a node that represents the contents of a side bar panel
   */
  abstract createContentElement(): React.ReactNode;

  /**
   * Gets the state of the side bar to save
   */
  getPanelState(): Record<string, any> {
    return this._panelState;
  }

  /**
   * Sets the state of the side bar panel
   * @param state Optional state to set
   */
  setPanelState(state: Record<string, any> | null): void {
    if (state) {
      this._panelState = { ...this._panelState, ...state };
    }
  }

  /**
   * Respond to state changes
   * @param state
   */
  async onStateChange(state: AppState): Promise<void> {}

  /**
   * Should update the panel header?
   */
  async shouldUpdatePanelHeader(): Promise<boolean> {
    return false;
  }

  /**
   * Signs that the expanded property changed
   */
  get expandedChanged(): ILiteEvent<boolean> {
    return this._expandedChanged;
  }
}

type SideBarEntry = {
  panel: ISideBarPanel;
  machines?: string[];
};

/**
 * Represents a service that handles side bar panels
 */
export class SideBarService implements ISideBarService {
  private readonly _registeredPanels = new Map<string, SideBarEntry[]>();
  private readonly _sortedPanels = new Map<string, ISideBarPanel[]>();
  private readonly _sideBarChanging = new LiteEvent<void>();
  private readonly _sideBarChanged = new LiteEvent<void>();
  private _activity: string | null = null;
  private _machineType: string | null = null;
  private _currentPanels: ISideBarPanel[] = [];

  constructor() {
    this.reset();
    getStore().machineTypeChanged.on((type) => {
      this._machineType = type;
      this._sideBarChanging.fire();
      this.refreshCurrentPanels();
      this._sideBarChanged.fire();
    });

    getStore().currentActivityChanged.on((activity) => {
      this.saveSideBarState();
      this._sideBarChanging.fire();
      this._activity = activity?.id;
      this.refreshCurrentPanels();
      this.applySideBarState();
      this._sideBarChanged.fire();
    });
  }

  /**
   * Removes every registered panel
   */
  reset(): void {
    this._registeredPanels.clear();
  }

  /**
   * Gets the current activity ID
   */
  get activity(): string | null {
    return this._activity;
  }

  /**
   * Registers a side bar panel for a particular activity.
   * @param activityPaneId ID of the activity
   * @param panel Panel to register
   */
  registerSideBarPanel(
    activityPaneId: string,
    panel: ISideBarPanel,
    machines?: string[]
  ): void {
    let panelList = this._registeredPanels.get(activityPaneId);
    if (panelList) {
      panelList.push({
        panel,
        machines,
      });
    } else {
      this._registeredPanels.set(activityPaneId, [{ panel, machines }]);
    }
  }

  /**
   * Gets the current set of side bar panels
   * @returns
   */
  getSideBarPanels(): ISideBarPanel[] {
    return this._currentPanels;
  }

  /**
   * Refreshes side bar panels
   */
  refreshSideBarPanels(): void {
    this._sideBarChanged.fire();
  }

  /**
   * This event is fired whenever the current activity is about to change.
   */
  get sideBarChanging(): ILiteEvent<void> {
    return this._sideBarChanging;
  }

  /**
   * This event is fired whenever the current activity has changed.
   */
  get sideBarChanged(): ILiteEvent<void> {
    return this._sideBarChanged;
  }

  get sideBarKey(): string {
    return this._activity && this._machineType
      ? `${this._activity}-${this._machineType}`
      : "";
  }

  /**
   * Moves the specified panel up
   * @param index Panel index
   */
  moveUp(index: number): void {
    if (index === 0) {
      return;
    }

    const panels = this._sortedPanels.get(this.sideBarKey);
    if (!panels || index > panels.length - 1) {
      return;
    }

    this._sideBarChanging.fire();
    const tmp = panels[index - 1];
    panels[index - 1] = panels[index];
    panels[index] = tmp;

    this._currentPanels = panels.slice(0);
    this._sortedPanels.set(this.sideBarKey, this._currentPanels);
    this.saveSideBarState();
    this.refreshCurrentPanels();
    this.applySideBarState();
    this._sideBarChanged.fire();
  }

  /**
   * Moves the specified panel up
   * @param index Panel index
   */
  moveDown(index: number): void {
    if (index < 0) {
      return;
    }

    const panels = this.getSideBarPanels();
    if (!panels || index > panels.length - 2) {
      return;
    }

    this._sideBarChanging.fire();
    const tmp = panels[index];
    panels[index] = panels[index + 1];
    panels[index + 1] = tmp;

    this._currentPanels = panels.slice(0);
    this._sortedPanels.set(this.sideBarKey, this._currentPanels);
    this.saveSideBarState();
    this.refreshCurrentPanels();
    this.applySideBarState();
    this._sideBarChanged.fire();
  }

  /**
   * Refreshes the list of panel on a change
   */
  private refreshCurrentPanels(): void {
    if (!this._activity || !this._machineType) {
      // --- No list of panels
      this._currentPanels = [];
      return;
    }

    // --- Is there a panel list for the current activity/machine type?
    const key = this.sideBarKey;
    this._currentPanels = this._sortedPanels.get(key);
    if (!this._currentPanels) {
      // --- No panel list for the current activity
      const panelEntries = this._registeredPanels.get(this._activity) ?? [];
      this._currentPanels = panelEntries
        .filter((pe) => !pe.machines || pe.machines.includes(this._machineType))
        .map((pe) => pe.panel);
      this._sortedPanels.set(key, this._currentPanels);
    }
  }

  private saveSideBarState(): void {
    const state: SideBarState = {};
    let panels = this.getSideBarPanels();
    for (let i = 0; i < panels.length; i++) {
      const panel = panels[i];
      state[`${this.activity}-${i}`] = panel.getPanelState() ?? {};
    }
    if (this.activity) {
      const fullState = Object.assign({}, getState().sideBar ?? {}, {
        [this.activity]: state,
      });
      dispatch(setSideBarStateAction(fullState));
    }
  }

  private applySideBarState(): void {
    const panels = this._currentPanels;
    const sideBarState = (getState().sideBar ?? {})[this.activity];
    for (let i = 0; i < panels.length; i++) {
      const panel = panels[i];
      const panelState = sideBarState?.[`${this.activity}-${i}`];
      if (panelState) {
        panel.setPanelState(panelState);
      }
    }
  }
}
