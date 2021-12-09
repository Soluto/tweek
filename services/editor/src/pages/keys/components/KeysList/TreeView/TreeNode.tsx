import React from 'react';
import KeyItem from './KeyItem';
import TreeDirectory from './TreeDirectory';
import { compsPathSorter, countLeafsInTree, leaf, TreeNode as TreeNodeType } from './treeUtils';

export type TreeNodeProps = {
  node: TreeNodeType;
  name: string;
  fullPath: string;
  depth: number;
  expandByDefault: boolean;
  selectedPath?: string;
};

const TreeNode = ({
  node,
  name,
  fullPath,
  depth,
  expandByDefault,
  selectedPath,
}: TreeNodeProps) => {
  const selected = Boolean(
    selectedPath && (fullPath === selectedPath || selectedPath.startsWith(`${fullPath}/`)),
  );

  if (node === leaf) {
    return <KeyItem name={name} fullPath={fullPath} depth={depth} selected={selected} />;
  }

  return (
    <TreeDirectory
      descendantsCount={countLeafsInTree(node)}
      name={name}
      fullPath={fullPath}
      depth={depth}
      selected={selected}
      expandByDefault={expandByDefault}
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
};

export default TreeNode;
