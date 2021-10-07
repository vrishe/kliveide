/**
 * Defines the properties of the themes that can be used with SpentNetEls.
 */
export interface IThemeProperties {
  /**
   * The background color of the shell canvas.
   */

  "--shell-font-family": string;
  "--shell-windows-font-family": string;
  
  "--shell-canvas-background-color": string;
  "--panel-separator-border": string;
  "--selected-border-color": string;
  "--selected-background-color": string;
  "--selection-color": string;
  "--information-color": string;
  "--hilited-color": string;
  "--console-font": string;

  "--list-hover-background-color": string;
  "--list-selected-background-color": string;

  "--button-background-color": string;
  "--button-primary-background-color": string;
  "--button-focused-border-color": string;

  "--toolbar-active-background-color": string;
  "--toolbar-inactive-background-color": string;
  "--toolbar-button-fill": string;
  "--toolbar-button-disabled-fill": string;
  "--toolbar-separator": string;
  
  "--scrollbar-background-color": string;
  
  "--statusbar-background-color": string;
  "--statusbar-foreground-color": string;

  "--menu-active-background-color": string;
  "--menu-text-color": string;
  "--menu-disabled-text-color": string;
  "--menu-pane-background-color": string;
  "--menu-pane-shadow": string;
  "--menu-selected-background": string;
  "--menu-selected-text-color": string;

  "--icon-default-size": string;
  "--icon-pointed-background": string;
  "--icon-mousedown-background": string;

  "--emulator-background-color": string;

  "--keyboard-background-color": string;
  "--key-background-color": string;
  "--key-main-color": string;
  "--key-keyboard-color": string;
  "--key-symbol-color": string;
  "--key-above-color": string;
  "--key-below-color": string;
  "--key-highlight-color": string;

  "--key-cz88-background-color": string;
  "--key-cz88-stroke-color": string;
  "--key-cz88-main-color": string;
  "--key-cz88-highlight-color": string;

  "--activity-bar-background-color": string;
  "--activity-icon-color": string;
  "--activity-current-icon-color": string;
  "--activity-current-background-color": string;

  "--sidebar-header-color": string;
  "--sidebar-background-color": string;
  "--sidebar-panel-header-color": string;

  "--splitter-hover-color": string;

  "--commandbar-background-color": string;
  "--document-tab-background-color": string;
  "--document-tab-color": string;
  "--document-tab-active-background-color": string;
  "--document-tab-active-color": string;

  "--command-button-pointed-background": string;

  "--dropdown-text-color": string;
  "--dropdown-backgound-color": string;

  "--dialog-header-background": string;

  "--console-ansi-black": string;
  "--console-ansi-blue": string;
  "--console-ansi-bright-black": string;
  "--console-ansi-bright-blue": string;
  "--console-ansi-bright-cyan": string;
  "--console-ansi-bright-green": string;
  "--console-ansi-bright-magenta": string;
  "--console-ansi-bright-red": string;
  "--console-ansi-bright-white": string;
  "--console-ansi-bright-yellow": string;
  "--console-ansi-cyan": string;
  "--console-ansi-green": string;
  "--console-ansi-magenta": string;
  "--console-ansi-red": string;
  "--console-ansi-white": string;
  "--console-ansi-yellow": string;

  "--interactive-input-color": string;

  "--explorer-folder-color": string;
  "--explorer-file-color": string;
}
