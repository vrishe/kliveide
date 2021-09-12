import * as React from "react";
import VirtualizedList, {
  VirtualizedListApi,
} from "../../common-ui/VirtualizedList";
import { ITreeNode } from "../../common-ui/ITreeNode";
import { SideBarPanelDescriptorBase } from "../side-bar/SideBarService";
import { SideBarPanelBase, SideBarProps } from "../SideBarPanelBase";
import { ProjectNode } from "./ProjectNode";
import { projectServices } from "./ProjectServices";
import { CSSProperties } from "react";
import { SvgIcon } from "../../common-ui/SvgIcon";
import { ideStore } from "../ideStore";
import { AppState, ProjectState } from "../../../shared/state/AppState";
import { ideToEmuMessenger } from "../IdeToEmuMessenger";
import { MenuItem } from "../../../shared/command/commands";
import { contextMenuService } from "../context-menu/ContextMenuService";
import { modalDialogService } from "../../common-ui/modal-service";
import { NEW_FOLDER_DIALOG_ID } from "./NewFolderDialog";
import { Store } from "redux";
import {
  ConfirmDialogResponse,
  CreateFileResponse,
  CreateFolderResponse,
  DeleteFileResponse,
  DeleteFolderResponse,
} from "../../../shared/messaging/message-types";
import { NewFileData } from "../../../shared/messaging/dto";
import { TreeNode } from "../../common-ui/TreeNode";
import { NEW_FILE_DIALOG_ID } from "./NewFileDialog";

type State = {
  itemsCount: number;
  selected?: ITreeNode<ProjectNode>;
  selectedIndex: number;
  isLoading: boolean;
};

/**
 * Project files panel
 */
export default class ProjectFilesPanel extends SideBarPanelBase<
  SideBarProps<{}>,
  State
> {
  private _listApi: VirtualizedListApi;
  private _onProjectChange: (state: ProjectState) => Promise<void>;

  constructor(props: SideBarProps<{}>) {
    super(props);
    this.state = {
      itemsCount: 0,
      selectedIndex: -1,
      isLoading: false,
    };
    this._onProjectChange = (state) => this.onProjectChange(state);
  }

  async componentDidMount(): Promise<void> {
    this.setState({
      itemsCount: this.itemsCount,
    });
    ideStore.projectChanged.on(this._onProjectChange);
  }

  componentWillUnmount(): void {
    ideStore.projectChanged.off(this._onProjectChange);
  }

  /**
   * Gets the number of items in the list
   */
  get itemsCount(): number {
    const tree = projectServices.getProjectTree();
    return tree && tree.rootNode ? tree.rootNode.viewItemCount : 0;
  }

  /**
   * Respond to project state changes
   */
  async onProjectChange(state: ProjectState): Promise<void> {
    if (state.isLoading) {
      this.setState({
        isLoading: true,
        itemsCount: 0,
      });
    } else {
      if (!state.path) {
        this.setState({
          isLoading: false,
          itemsCount: 0,
        });
      } else {
        projectServices.setProjectContents(state.directoryContents);
        this.setState({
          isLoading: false,
          itemsCount: this.itemsCount,
        });
      }
    }
  }

  render() {
    let slice: ITreeNode<ProjectNode>[];
    if (this.state.itemsCount > 0) {
      return (
        <VirtualizedList
          itemHeight={22}
          numItems={this.state.itemsCount}
          integralPosition={false}
          renderItem={(
            index: number,
            style: CSSProperties,
            startIndex: number,
            endIndex: number
          ) => {
            if (index === startIndex) {
              slice = this.getListItemRange(startIndex, endIndex);
            }
            return this.renderItem(index, style, slice[index - startIndex]);
          }}
          registerApi={(api) => (this._listApi = api)}
          handleKeys={(e) => this.handleKeys(e)}
          onFocus={() => {
            this.signFocus(true);
            this._listApi.forceRefresh();
          }}
          onBlur={() => {
            this.signFocus(false);
            this._listApi.forceRefresh();
          }}
        />
      );
    } else {
      const panelStyle: CSSProperties = {
        display: "flex",
        flexDirection: "column",
        flexGrow: 1,
        flexShrink: 1,
        width: "100%",
        height: "100%",
        fontSize: "0.8em",
        color: "var(--information-color)",
        paddingLeft: 20,
        paddingRight: 20,
      };
      const buttonStyle: CSSProperties = {
        backgroundColor: "var(--selected-background-color)",
        color: "var(--menu-text-color)",
        width: "100%",
        border: "none",
        marginTop: 13,
        padding: 8,
        cursor: "pointer",
      };
      return (
        <div style={panelStyle}>
          {!this.state.isLoading && (
            <>
              <span style={{ marginTop: 13 }}>
                You have not yet opened a folder.
              </span>
              <button
                style={buttonStyle}
                onClick={async () => {
                  await ideToEmuMessenger.sendMessage({
                    type: "OpenProjectFolder",
                  });
                }}
              >
                Open Folder
              </button>
            </>
          )}
        </div>
      );
    }
  }

  renderItem(
    index: number,
    style: CSSProperties,
    item: ITreeNode<ProjectNode>
  ) {
    const itemStyle: CSSProperties = {
      display: "flex",
      alignItems: "center",
      width: "100%",
      height: 22,
      fontSize: "0.8em",
      cursor: "pointer",
      background:
        item === this.state.selected
          ? this.state.focused
            ? "var(--selected-background-color)"
            : "var(--list-selected-background-color)"
          : undefined,
      border:
        item === this.state.selected
          ? this.state.focused
            ? "1px solid var(--selected-border-color)"
            : "1px solid transparent"
          : "1px solid transparent",
    };
    return (
      <div
        key={index}
        className="listlike"
        style={{ ...style, ...itemStyle }}
        onContextMenu={(ev) => this.onContextMenu(ev, index, item)}
        onClick={() => this.collapseExpand(index, item)}
      >
        <div
          style={{
            width: 22 + 12 * item.level + (item.nodeData.isFolder ? 0 : 16),
          }}
        ></div>
        {item.nodeData.isFolder && (
          <SvgIcon
            iconName="chevron-right"
            width={16}
            height={16}
            rotate={item.isExpanded ? 90 : 0}
          />
        )}
        <SvgIcon
          iconName={
            item.nodeData.isFolder
              ? item.isExpanded
                ? "folder-opened"
                : "folder"
              : "file-code"
          }
          width={16}
          height={16}
          style={{ marginLeft: 4, marginRight: 4 }}
          fill={
            item.nodeData.isFolder
              ? "--explorer-folder-color"
              : "--explorer-file-color"
          }
        />
        <span>{item.nodeData.name}</span>
      </div>
    );
  }

  /**
   * Retrieves the items slice of the specified range.
   */
  getListItemRange(
    start: number,
    end: number,
    topHidden?: number
  ): ITreeNode<ProjectNode>[] {
    const tree = projectServices.getProjectTree();
    const offset = topHidden || 0;
    if (!tree) {
      return [];
    }
    return tree.getViewNodeRange(start + offset, end + offset);
  }

  /**
   * Collapse or expand the specified item
   * @param index Item index
   * @param item Node
   */
  collapseExpand(index: number, item: ITreeNode<ProjectNode>): void {
    item.isExpanded = !item.isExpanded;
    this.setState({
      itemsCount: this.itemsCount,
      selected: item,
      selectedIndex: index,
    });
    this._listApi.forceRefresh();
  }

  /**
   * Allow moving in the project explorer with keys
   */
  handleKeys(e: React.KeyboardEvent): void {
    const tree = projectServices.getProjectTree();
    let newIndex = -1;
    switch (e.code) {
      case "ArrowUp":
        if (this.state.selectedIndex <= 0) return;
        newIndex = this.state.selectedIndex - 1;
        break;

      case "ArrowDown": {
        if (this.state.selectedIndex >= this.state.itemsCount - 1) return;
        newIndex = this.state.selectedIndex + 1;
        break;
      }
      case "Home": {
        newIndex = 0;
        break;
      }
      case "End": {
        newIndex = this.state.itemsCount - 1;
        break;
      }
      case "Space":
      case "Enter":
        if (!this.state.selected) return;
        this.collapseExpand(this.state.selectedIndex, this.state.selected);
        break;
      default:
        return;
    }
    if (newIndex >= 0) {
      this._listApi.ensureVisible(newIndex);
      this.setState({
        selectedIndex: newIndex,
        selected: tree.getViewNodeByIndex(newIndex),
      });
      this._listApi.forceRefresh();
    }
  }

  async onContextMenu(
    ev: React.MouseEvent,
    index: number,
    item: ITreeNode<ProjectNode>
  ): Promise<void> {
    let menuItems: MenuItem[];
    if (item.nodeData.isFolder) {
      // --- Create menu items
      menuItems = [
        {
          id: "newFolder",
          text: "New Folder...",
          execute: async () => {
            await this.newFolder(item, index);
          },
        },
        {
          id: "newFile",
          text: "New File...",
          execute: async () => {
            await this.newFile(item, index);
          },
        },
        "separator",
        {
          id: "copyPath",
          text: "Copy Path",
          execute: async () => {
            await navigator.clipboard.writeText(
              item.nodeData.fullPath.replace(/\\/g, "/")
            );
          },
        },
        "separator",
        {
          id: "renameFolder",
          text: "Rename",
          execute: async () => {
            console.log("Rename");
          },
        },
        {
          id: "deleteFolder",
          text: "Delete",
          enabled: index !== 0,
          execute: async () => await this.deleteFolder(item, index),
        },
      ];
    } else {
      menuItems = [
        {
          id: "copyPath",
          text: "Copy Path",
          execute: async () => {
            await navigator.clipboard.writeText(
              item.nodeData.fullPath.replace(/\\/g, "/")
            );
          },
        },
        "separator",
        {
          id: "renameFile",
          text: "Rename",
          execute: async () => {
            console.log("Rename");
          },
        },
        {
          id: "deleteFile",
          text: "Delete",
          execute: async () => await this.deleteFile(item, index),
        },
      ];
    }
    const rect = (ev.target as HTMLElement).getBoundingClientRect();
    await contextMenuService.openMenu(
      menuItems,
      rect.y + 22,
      ev.clientX,
      ev.target as HTMLElement
    );
  }

  /**
   * Creates a new folder in the specified folder node
   * @param node Folder node
   * @param index Node index
   */
  async newFolder(node: ITreeNode<ProjectNode>, index: number): Promise<void> {
    // --- Get the name of the new folder
    const folderData = (await modalDialogService.showModalDialog(
      ideStore as Store,
      NEW_FOLDER_DIALOG_ID,
      {
        root: node.nodeData.fullPath,
      }
    )) as NewFileData;

    if (!folderData) {
      // --- No folder to create
      return;
    }

    // --- Create the new folder
    const newName = folderData.name;
    const newFullPath = `${folderData.root}/${newName}`;
    const resp = await ideToEmuMessenger.sendMessage<CreateFolderResponse>({
      type: "CreateFolder",
      name: newFullPath,
    });

    if (resp.error) {
      // --- Creation failed. The main process has already displayed a message
      return;
    }

    // --- Insert the new node into the tree
    let newPosition = 0;
    const childCount = node.childCount;
    for (let i = 0; i < childCount; i++, newPosition++) {
      const child = node.getChild(i);
      if (!child.nodeData.isFolder || newName < child.nodeData.name) break;
    }
    const newTreeNode = new TreeNode<ProjectNode>({
      isFolder: true,
      name: newName,
      fullPath: newFullPath,
    });
    node.insertChildAt(newPosition, newTreeNode);
    node.isExpanded = true;

    // --- Refresh the view
    const selectedIndex = index + newPosition + 1;
    this.setState({
      selectedIndex,
      selected: newTreeNode,
      itemsCount: this.itemsCount,
    });
    this._listApi.focus();
    this._listApi.ensureVisible(selectedIndex);
    this._listApi.forceRefresh();
  }

  /**
   * Creates a new file in the specified folder node
   * @param node Folder node
   * @param index Node index
   */
  async newFile(node: ITreeNode<ProjectNode>, index: number): Promise<void> {
    // --- Get the name of the new folder
    const fileData = (await modalDialogService.showModalDialog(
      ideStore as Store,
      NEW_FILE_DIALOG_ID,
      {
        root: node.nodeData.fullPath,
      }
    )) as NewFileData;

    if (!fileData) {
      // --- No folder to create
      return;
    }

    // --- Create the new file
    const newName = fileData.name;
    const newFullPath = `${fileData.root}/${newName}`;
    const resp = await ideToEmuMessenger.sendMessage<CreateFileResponse>({
      type: "CreateFile",
      name: newFullPath,
    });

    if (resp.error) {
      // --- Creation failed. The main process has already displayed a message
      return;
    }

    // --- Insert the new node into the tree
    let newPosition = 0;
    const childCount = node.childCount;
    for (let i = 0; i < childCount; i++, newPosition++) {
      const child = node.getChild(i);
      if (child.nodeData.isFolder) continue;
      if (newName < child.nodeData.name) break;
    }
    const newTreeNode = new TreeNode<ProjectNode>({
      isFolder: false,
      name: newName,
      fullPath: newFullPath,
    });
    node.insertChildAt(newPosition, newTreeNode);
    node.isExpanded = true;

    // --- Refresh the view
    const selectedIndex = index + newPosition + 1;
    this.setState({
      selectedIndex,
      selected: newTreeNode,
      itemsCount: this.itemsCount,
    });
    this._listApi.focus();
    this._listApi.ensureVisible(selectedIndex);
    this._listApi.forceRefresh();
  }

  /**
   * Deletes the specified file
   * @param node File node
   * @param index Node index
   */
  async deleteFile(node: ITreeNode<ProjectNode>, index: number): Promise<void> {
    // --- Confirm delete
    const result = await ideToEmuMessenger.sendMessage<ConfirmDialogResponse>({
      type: "ConfirmDialog",
      title: "Confirm delete",
      question: `Are you sure you want to delete the ${node.nodeData.fullPath} file?`,
    });
    if (!result.confirmed) {
      // --- Delete aborted
      return;
    }

    // --- Delete the file
    const resp = await ideToEmuMessenger.sendMessage<DeleteFileResponse>({
      type: "DeleteFile",
      name: node.nodeData.fullPath,
    });
    if (resp.error) {
      // --- Delete failed
      return;
    }

    // --- Refresh the view
    node.parentNode.removeChild(node);
    this.setState({
      itemsCount: this.itemsCount,
    });
    this._listApi.focus();
    this._listApi.forceRefresh();
  }

  /**
   * Deletes the specified file
   * @param node File node
   * @param index Node index
   */
  async deleteFolder(
    node: ITreeNode<ProjectNode>,
    index: number
  ): Promise<void> {
    // --- Confirm delete
    const result = await ideToEmuMessenger.sendMessage<ConfirmDialogResponse>({
      type: "ConfirmDialog",
      title: "Confirm delete",
      question: `Are you sure you want to delete the ${node.nodeData.fullPath} folder?`,
    });
    if (!result.confirmed) {
      // --- Delete aborted
      return;
    }

    // --- Delete the file
    const resp = await ideToEmuMessenger.sendMessage<DeleteFolderResponse>({
      type: "DeleteFolder",
      name: node.nodeData.fullPath,
    });
    if (resp.error) {
      // --- Delete failed
      return;
    }

    // --- Refresh the view
    node.parentNode.removeChild(node);
    this.setState({
      itemsCount: this.itemsCount,
    });
    this._listApi.focus();
    this._listApi.forceRefresh();
  }
}

/**
 * Descriptor for the sample side bar panel
 */
export class ProjectFilesPanelDescriptor extends SideBarPanelDescriptorBase {
  private _lastProjectState: ProjectState = null;
  private _shouldRefresh = false;

  /**
   * Panel title
   */
  get title(): string {
    const projectState = ideStore.getState().project;
    return projectState?.projectName
      ? `${projectState.projectName}${projectState?.hasVm ? "" : " (No VM)"}`
      : "No project opened";
  }

  /**
   * Creates a node that represents the contents of a side bar panel
   */
  createContentElement(): React.ReactNode {
    return <ProjectFilesPanel descriptor={this} />;
  }

  /**
   * Respond to state changes
   * @param state
   */
  async onStateChange(state: AppState): Promise<void> {
    if (this._lastProjectState !== state.project) {
      this._lastProjectState = state.project;
      this.expanded = true;
      this._shouldRefresh = true;
      return;
    }
    this._shouldRefresh = false;
  }

  /**
   * Should update the panel header?
   */
  async shouldUpdatePanelHeader(): Promise<boolean> {
    return this._shouldRefresh;
  }
}
