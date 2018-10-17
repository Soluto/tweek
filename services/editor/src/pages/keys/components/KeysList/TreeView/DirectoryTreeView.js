import React from 'react';
import PropTypes from 'prop-types';
import TreeNode from './TreeNode';
import { compsPathSorter, leaf } from './pathSorter';
import './TreeView.css';

export default function DirectoryTreeView({
  paths,
  renderItem,
  selectedPath,
  expandByDefault,
  items,
}) {
  let pathTree = pathsToTree(paths);
  return (
    <div className="key-folder" data-comp="directory-tree-view">
      {Object.keys(pathTree)
        .map(pathNode => (
          <TreeNode
            key={pathNode}
            name={pathNode}
            node={pathTree[pathNode]}
            selectedPath={selectedPath}
            fullPath={pathNode}
            itemExtractor={path => items && items.find(i => i.key_path === path)}
            depth={1}
            expandByDefault={expandByDefault}
            renderItem={renderItem}
          />
        ))
        .sort(compsPathSorter)}
    </div>
  );
}

DirectoryTreeView.propTypes = {
  paths: PropTypes.arrayOf(PropTypes.string).isRequired,
  renderItem: PropTypes.func.isRequired,
  expandByDefault: PropTypes.bool,
};

function pathsToTree(paths) {
  let tree = {};
  paths.map(x => x.split('/')).forEach((fragments) => {
    const last = fragments.pop();
    fragments.reduce((node, frag) => (node[frag] = node[frag] || {}), tree)[last] = leaf;
  });

  return tree;
}
