import React from 'react';
import * as R from 'ramda';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { mapProps, compose, shouldUpdate } from 'recompose';
import * as keysActions from '../../../../../store/ducks/keys';
import { addKey } from '../../../../../store/ducks/selectedKey';
import { KeyItem } from './KeyItem';
import TreeDirectory from './TreeDirectory';
import { compsPathSorter, leaf } from './treeUtils';

const TreeNode = compose(
  connect((state) => state, { ...keysActions, addKey }),
  mapProps(({ selectedPath, fullPath, ...props }) => ({
    selectedPath,
    fullPath,
    selected:
      selectedPath && (fullPath === selectedPath || selectedPath.startsWith(`${fullPath}/`)),
    ...props,
  })),
  shouldUpdate(
    ({ selectedPath: _, ...oldProps }, { selectedPath: __, ...newProps }) =>
      !R.equals(oldProps, newProps),
  ),
)(({ node, name, fullPath, depth, expandByDefault, selected, selectedPath, addKey, keys }) => {
  return node === leaf ? (
    <KeyItem name={name} fullPath={fullPath} depth={depth} selected={selected} keys={keys} />
  ) : (
    <TreeDirectory
      descendantsCount={countLeafsInTree(node)}
      name={name}
      selectedPath={selectedPath}
      fullPath={fullPath}
      depth={depth}
      selected={selected}
      expandByDefault={expandByDefault}
      addKey={addKey}
    >
      {Object.entries(node)
        .sort(compsPathSorter)
        .map(([childPath, childNode]) => (
          <TreeNode
            key={childPath}
            name={childPath}
            selectedPath={selectedPath}
            node={childNode}
            fullPath={`${fullPath}/${childPath}`}
            depth={depth + 1}
            expandByDefault={expandByDefault}
          />
        ))}
    </TreeDirectory>
  );
});

TreeNode.propTypes = {
  node: PropTypes.oneOfType([PropTypes.object, PropTypes.symbol]).isRequired,
  name: PropTypes.string.isRequired,
  fullPath: PropTypes.string,
  depth: PropTypes.number.isRequired,
  expandByDefault: PropTypes.bool,
};

function countLeafsInTree(tree) {
  if (typeof tree === 'symbol') return 1;

  return Object.keys(tree).reduce(
    (aggregator, item) => aggregator + countLeafsInTree(tree[item]),
    0,
  );
}

export default TreeNode;
