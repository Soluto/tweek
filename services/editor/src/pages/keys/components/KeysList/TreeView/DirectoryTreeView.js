import PropTypes from 'prop-types';
import React from 'react';
import { compsPathSorter, pathsToTree } from './treeUtils';
import TreeNode from './TreeNode';
import './TreeView.css';

const DirectoryTreeView = ({ paths, selectedPath, expandByDefault }) => {
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

DirectoryTreeView.propTypes = {
  paths: PropTypes.arrayOf(PropTypes.string).isRequired,
  expandByDefault: PropTypes.bool,
};

export default DirectoryTreeView;
