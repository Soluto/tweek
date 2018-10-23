import React from 'react';
import * as R from 'ramda';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { mapProps, compose, shouldUpdate } from 'recompose';
import * as keysActions from '../../../../../store/ducks/keys';
import { addKey } from '../../../../../store/ducks/selectedKey';
import TreeDirectory from './TreeDirectory';
import { compsPathSorter, leaf } from './pathSorter';

const TreeNode = compose(
  connect(state => state, { ...keysActions, addKey }),
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
)(
  ({
    node,
    name,
    fullPath,
    depth,
    renderItem,
    expandByDefault,
    selected,
    selectedPath,
    addKey,
  }) => {
    let LeafElement = renderItem;
    return node === leaf ? (
      <LeafElement {...{ name, fullPath, depth, selected }} />
    ) : (
      <TreeDirectory
        descendantsCount={countLeafsInTree(node)}
        {...{
          name,
          selectedPath,
          fullPath,
          depth,
          selected,
          expandByDefault: expandByDefault,
          addKey,
        }}
      >
        {Object.keys(node)
          .map(childPath => (
            <TreeNode
              key={childPath}
              name={childPath}
              selectedPath={selectedPath}
              node={node[childPath]}
              fullPath={`${fullPath}/${childPath}`}
              depth={depth + 1}
              renderItem={renderItem}
              expandByDefault={expandByDefault}
            />
          ))
          .sort(compsPathSorter)}
      </TreeDirectory>
    );
  },
);

TreeNode.propTypes = {
  node: PropTypes.oneOfType([PropTypes.object, PropTypes.symbol]).isRequired,
  name: PropTypes.string.isRequired,
  fullPath: PropTypes.string,
  depth: PropTypes.number.isRequired,
  renderItem: PropTypes.func.isRequired,
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
