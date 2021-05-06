import PropTypes from 'prop-types';
import React from 'react';
import { compsPathSorter, leaf } from './pathSorter';
import TreeNode from './TreeNode';
import './TreeView.css';

function pathsToTree(paths) {
  let tree = {};
  paths
    .map((x) => x.split('/'))
    .forEach((fragments) => {
      const last = fragments.pop();
      fragments.reduce((node, frag) => (node[frag] = node[frag] || {}), tree)[last] = leaf;
    });

  return tree;
}

const DirectoryTreeView = ({ paths, selectedPath, expandByDefault }) => {
  let pathTree = pathsToTree(paths);
  return (
    <div className="key-folder" data-comp="directory-tree-view">
      {Object.keys(pathTree)
        .map((pathNode) => (
          <TreeNode
            key={pathNode}
            name={pathNode}
            node={pathTree[pathNode]}
            selectedPath={selectedPath}
            fullPath={pathNode}
            depth={1}
            expandByDefault={expandByDefault}
          />
        ))
        .sort(compsPathSorter)}
    </div>
  );
};

DirectoryTreeView.propTypes = {
  paths: PropTypes.arrayOf(PropTypes.string).isRequired,
  expandByDefault: PropTypes.bool,
};

export default DirectoryTreeView;
