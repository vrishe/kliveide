import { ITreeView } from "../../common-ui/ITreeNode";
import { ProjectNode } from "./ProjectNode";
import { TreeNode } from "../../common-ui/TreeNode";
import { TreeView } from "../../common-ui/TreeView";
import { DirectoryContent } from "../../../shared/state/AppState";

/**
 * This class implements the project services
 */
class ProjectServices {
  private _projectTree: ITreeView<ProjectNode> | null = null;

  /**
   * Gets the current project tree
   * @returns Project tree, if set; otherwise, null
   */
  getProjectTree(): ITreeView<ProjectNode> | null {
    return this._projectTree;
  }

  /**
   * Sets the project folder to the specified one
   * @param name
   */
  async setProjectContents(contents?: DirectoryContent): Promise<void> {
    if (contents) {
      this._projectTree = new TreeView(this.createTreeFrom(contents));
    } else {
      this._projectTree = null;
    }
  }

  /**
   * Creates a tree view from the specified contents
   */
  createTreeFrom(
    contents: DirectoryContent,
    rootPath: string = null
  ): TreeNode<ProjectNode> {
    const root = new TreeNode<ProjectNode>({
      name: contents.name.replace(/\\/g, "/"),
      isFolder: true,
      fullPath: (rootPath
        ? `${rootPath}/${contents.name}`
        : contents.name
      ).replace(/\\/g, "/"),
    });
    contents.folders
      .sort((a, b) => {
        return a.name > b.name ? 1 : a.name < b.name ? 1 : 0;
      })
      .forEach((f) => {
        const folderNode = this.createTreeFrom(f, root.nodeData.fullPath);
        folderNode.isExpanded = false;
        root.appendChild(folderNode);
      });
    contents.files.sort().forEach((f) => {
      root.appendChild(
        new TreeNode<ProjectNode>({
          name: f,
          isFolder: false,
          fullPath: `${root.nodeData.fullPath}/${f}`,
        })
      );
    });
    return root;
  }
}

/**
 * The singleton instance of project services
 */
export const projectServices = new ProjectServices();
