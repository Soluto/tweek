import React from 'react';
import PropTypes from 'prop-types';
import { VelocityTransitionGroup } from 'velocity-react';
import openedFolderIconSrc from './resources/Folder-icon-opened.svg';
import closedFolderIconSrc from './resources/Folder-icon-closed.svg';
import './KeysList.css';

const leaf = Symbol();

export default function DirectoryTreeView({ paths, renderItem, expandByDefault }) {
  let pathTree = pathsToTree(paths);
  return (
    <div className="key-folder" data-comp="directory-tree-view">
      {Object.keys(pathTree).map(pathNode =>
        <TreeNode
          key={pathNode}
          name={pathNode}
          node={pathTree[pathNode]}
          fullPath={pathNode}
          depth={1}
          expandByDefault={expandByDefault}
          renderItem={renderItem}
        />,
      )}
    </div>
  );
}

DirectoryTreeView.propTypes = {
  paths: PropTypes.arrayOf(PropTypes.string).isRequired,
  renderItem: PropTypes.func.isRequired,
  expandByDefault: PropTypes.bool,
};

function TreeNode({ node, name, fullPath, depth, renderItem, expandByDefault }) {
  let LeafElement = renderItem;

  return node === leaf
    ? <LeafElement {...{ name, fullPath, depth }} />
    : <TreeDirectory
        descendantsCount={countLeafsInTree(node)}
        {...{ name, fullPath, depth, expandByDefault }}
      >
        {Object.keys(node).map(childPath =>
          <TreeNode
            key={childPath}
            name={childPath}
            node={node[childPath]}
            fullPath={`${fullPath}/${childPath}`}
            depth={depth + 1}
            renderItem={renderItem}
            expandByDefault={expandByDefault}
          />,
        )}
      </TreeDirectory>;
}

TreeNode.propTypes = {
  node: PropTypes.oneOfType([PropTypes.object, PropTypes.symbol]).isRequired,
  name: PropTypes.string.isRequired,
  fullPath: PropTypes.string,
  depth: PropTypes.number.isRequired,
  renderItem: PropTypes.func.isRequired,
  expandByDefault: PropTypes.bool,
};

class TreeDirectory extends React.Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
    fullPath: PropTypes.string,
    depth: PropTypes.number.isRequired,
    children: PropTypes.arrayOf(PropTypes.node).isRequired,
    expandByDefault: PropTypes.bool,
  }

  constructor(props) {
    super(props);

    this.state = {
      isCollapsed: !props.expandByDefault,
    };
  }

  render() {
    let { fullPath, name, depth, children, descendantsCount } = this.props;
    let { isCollapsed } = this.state;

    return (
      <div className="key-folder">

        <div
          style={{ paddingLeft: (depth + 1) * 10 }}
          className="key-folder-name"
          onClick={() => this.setState({ isCollapsed: !isCollapsed })}
          data-folder-name={fullPath}
        >
          <img
            className="key-folder-icon"
            src={isCollapsed ? closedFolderIconSrc : openedFolderIconSrc}
          />
          {name}
          <label className="number-of-folder-keys">{descendantsCount}</label>
        </div>

        <VelocityTransitionGroup enter={{ animation: 'slideDown' }} leave={{ animation: 'slideUp' }}>
          {isCollapsed
            ? undefined
            : <ul className="folder-items">
                {children.map((child, i) => <li className="sub-tree" key={i}>{child}</li>)}
              </ul>}
        </VelocityTransitionGroup>
      </div>
    );
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.expandByDefault !== nextProps.expandByDefault) {
      this.setState({
        isCollapsed: !nextProps.expandByDefault,
      });
    }
  }
}

function pathsToTree(paths) {
  let tree = {};
  paths.map(x => x.split('/')).forEach((fragments) => {
    const last = fragments.pop();
    fragments.reduce((node, frag) => (node[frag] = node[frag] || {}), tree)[last] = leaf;
  });

  return tree;
}

function countLeafsInTree(tree) {
  if (typeof tree === 'symbol') return 1;

  return Object.keys(tree).reduce(
    (aggregator, item) => aggregator + countLeafsInTree(tree[item]),
    0,
  );
}
