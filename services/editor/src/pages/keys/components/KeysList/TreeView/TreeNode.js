import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import * as keysActions from '../../../../../store/ducks/keys';
import { addKey } from '../../../../../store/ducks/selectedKey';
import { KeyItem } from './KeyItem';
import TreeDirectory from './TreeDirectory';
import { compsPathSorter, countLeafsInTree, leaf } from './treeUtils';

const enhance = connect((state) => state, { ...keysActions, addKey });

const TreeNode = ({ node, name, fullPath, depth, expandByDefault, selectedPath, addKey, keys }) => {
  const selected =
    selectedPath && (fullPath === selectedPath || selectedPath.startsWith(`${fullPath}/`));

  if (node === leaf) {
    return (
      <KeyItem name={name} fullPath={fullPath} depth={depth} selected={selected} keys={keys} />
    );
  }

  return (
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
            keys={keys}
          />
        ))}
    </TreeDirectory>
  );
};

TreeNode.propTypes = {
  node: PropTypes.oneOfType([PropTypes.object, PropTypes.symbol]).isRequired,
  name: PropTypes.string.isRequired,
  fullPath: PropTypes.string,
  depth: PropTypes.number.isRequired,
  expandByDefault: PropTypes.bool,
};

export default enhance(TreeNode);
