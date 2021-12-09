import React from 'react';
import TreeNode from './TreeNode';
import { compsPathSorter, pathsToTree } from './treeUtils';
import './TreeView.css';

export type DirectoryTreeViewProps = {
  paths: string[];
  selectedPath?: string;
  expandByDefault: boolean;
};

const DirectoryTreeView = ({ paths, selectedPath, expandByDefault }: DirectoryTreeViewProps) => {
  const pathTree = pathsToTree(paths);

  return (
    <div className="key-folder" data-comp="directory-tree-view">
      {Object.entries(pathTree)
        .sort(compsPathSorter)
        .map(([pathNode, children]) => (
          <TreeNode
            key={pathNode}
            name={pathNode}
            node={children}
            selectedPath={selectedPath}
            fullPath={pathNode}
            depth={1}
            expandByDefault={expandByDefault}
          />
        ))}
    </div>
  );
};

export default DirectoryTreeView;
