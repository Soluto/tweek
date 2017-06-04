import React from 'react';

import style from './KeysList.css';
import openedFolderIconSrc from './resources/Folder-icon-opened.svg';
import closedFolderIconSrc from './resources/Folder-icon-closed.svg';
import { VelocityTransitionGroup } from 'velocity-react';

const leaf = Symbol();

export default function DirectoryTreeView({ paths, renderItem, expandByDefault }) {
  let pathTree = pathsToTree(paths);
  return (
    <div className={style['key-folder']}>
      {Object.keys(pathTree).map(pathNode => (
        <TreeNode
          key={pathNode}
          name={pathNode}
          node={pathTree[pathNode]}
          fullPath={pathNode}
          depth={1}
          expandByDefault={expandByDefault}
          renderItem={renderItem}
        />
      ))}
    </div>
  );
}

DirectoryTreeView.propTypes = {
  paths: React.PropTypes.arrayOf(React.PropTypes.string).isRequired,
  renderItem: React.PropTypes.func.isRequired,
  expandByDefault: React.PropTypes.bool,
};

function TreeNode({ node, name, fullPath, depth, renderItem, expandByDefault }) {
  let LeafElement = renderItem;

  return node === leaf
    ? <LeafElement {...{ name, fullPath, depth }} />
    : <TreeDirectory
      descendantsCount={countLeafsInTree(node)}
      {...{ name, fullPath, depth, expandByDefault }}
    >
      {Object.keys(node).map(childPath => (
        <TreeNode
          key={childPath}
          name={childPath}
          node={node[childPath]}
          fullPath={`${fullPath}/${childPath}`}
          depth={depth + 1}
          renderItem={renderItem}
          expandByDefault={expandByDefault}
        />
        ))}
    </TreeDirectory>;
}

TreeNode.propTypes = {
  node: React.PropTypes.oneOfType([React.PropTypes.object, React.PropTypes.symbol]).isRequired,
  name: React.PropTypes.string.isRequired,
  fullPath: React.PropTypes.string,
  depth: React.PropTypes.number.isRequired,
  renderItem: React.PropTypes.func.isRequired,
  expandByDefault: React.PropTypes.bool,
};

class TreeDirectory extends React.Component {
  static propTypes = {
    name: React.PropTypes.string.isRequired,
    fullPath: React.PropTypes.string,
    depth: React.PropTypes.number.isRequired,
    children: React.PropTypes.arrayOf(React.PropTypes.node).isRequired,
    expandByDefault: React.PropTypes.bool,
  };

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
      <div className={style['key-folder']}>

        <div
          style={{ paddingLeft: (depth + 1) * 10 }}
          className={style['key-folder-name']}
          onClick={() => this.setState({ isCollapsed: !isCollapsed })}
          data-folder-name={fullPath}
        >
          <img
            className={style['key-folder-icon']}
            src={isCollapsed ? closedFolderIconSrc : openedFolderIconSrc}
          />
          {name}
          <label className={style['number-of-folder-keys']}>{descendantsCount}</label>
        </div>

        <VelocityTransitionGroup
          enter={{ animation: 'slideDown' }}
          leave={{ animation: 'slideUp' }}
        >
          {isCollapsed
            ? undefined
            : <ul className={style['folder-items']}>
              {children.map((child, i) => <li className={style['sub-tree']} key={i}>{child}</li>)}
            </ul>}
        </VelocityTransitionGroup>
      </div>
    );
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.expandByDefault != nextProps.expandByDefault) {
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
