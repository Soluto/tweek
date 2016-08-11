import React from 'react';
import { Link } from 'react-router';
import style from './KeysList.css';
import wrapComponentWithClass from '../../../../utils/wrapComponentWithClass';
import { componentFromStream, createEventHandler } from 'recompose';
import { Observable } from 'rxjs/Rx';
import { connect } from 'react-redux';
import { compose, pure, mapProps, withState } from 'recompose';
import classNames from 'classnames';
import { VelocityComponent, VelocityTransitionGroup } from 'velocity-react';
import openedFolderIconSrc from './resources/Folder-icon-opened.svg';
import closedFolderIconSrc from './resources/Folder-icon-closed.svg';

let leaf = Symbol();
let getName = (path) => path.split('/').slice(-1)[0];

const getNumberOfTreeNodeKeys = (tree) => {
  if ((typeof tree) === 'symbol') return 1;

  let result = 0;
  Object.keys(tree).forEach(_ => {
    result += getNumberOfTreeNodeKeys(tree[_]);
  });

  return result;
}

const TreeKeyItem = compose(
  connect(state => ({ selectedKey: state.selectedKey && state.selectedKey.key })),
  mapProps(({ selectedKey, path, ...props }) => ({ isActive: selectedKey === path, path, ...props })),
pure)(({ isActive, path, pad }) =>
  <Link className={classNames(style['key-link'], { [style['selected']]: isActive }) }
    style={{ paddingLeft: pad }}
    to={`/keys/${path}`}
    >{getName(path) }
  </Link>
);

const TreeFolder = withState('isCollapsed', 'setIsCollapsed', true)(({ currentPath, tree, pad, isCollapsed, setIsCollapsed }) => {
  return (<div className={style['key-folder']}>
    {getName(currentPath) ? (
      <div style={{ paddingLeft: pad }} className={style['key-folder-name']}
        onClick={
          () => {
            setIsCollapsed(!isCollapsed);
          } }>
        {isCollapsed ?
          <img className={style['key-folder-icon']} src={closedFolderIconSrc}/> :
          <img className={style['key-folder-icon']} src={openedFolderIconSrc}/>}
        {currentPath}
        <label className={style['number-of-folder-keys']}>({getNumberOfTreeNodeKeys(tree) }) </label>
      </div>
    )
      :
      null}

    <VelocityTransitionGroup enter={{ animation: 'slideDown' }} leave={{ animation: 'slideUp' }}>
      {!isCollapsed || currentPath === '' ?
        <ul className={style['folder-items']}>
          {Object.keys(tree).map(key => (
            <li className={style['sub-tree']} key={key}>
              {renderTree(tree[key], currentPath === '' ? `${key}` : `${currentPath}/${key}`, pad + 10) }
            </li>
          )) }
        </ul> : undefined}
    </VelocityTransitionGroup>

  </div >);
});

function renderTree(tree, currentPath, pad) {
  return tree === leaf ?
    (<div className={style['key-link-wrapper']}>
      <TreeKeyItem path={currentPath} pad={pad} />
    </div>)
    :
    (
      <TreeFolder currentPath={currentPath} tree={tree} pad={pad} />
    );
}

function keysToTree(keys) {
  let tree = {};
  keys.map(x => x.split('/'))
    .forEach(fragments => {
      const last = fragments.pop();
      fragments.reduce((node, frag) => node[frag] = node[frag] || {}, tree)[last] = leaf;
    });

  return tree;
}

export default wrapComponentWithClass(componentFromStream(prop$ => {
  const keyList$ = prop$.map(x => x.keys).distinctUntilChanged();

  const { handler: setFilter, stream: filter$ } = createEventHandler();
  const textFilter$ = filter$.debounceTime(300).startWith('');

  const filteredKeys$ = Observable.combineLatest(textFilter$, keyList$)
    .map(([filter, keys]) => keys.filter(key => key.includes(filter)));

  return filteredKeys$
    .map(keysToTree)
    .map(filteredTree =>
      <div className={style['keys-list-container']}>
        <div className={style['search-input-wrapper']}>
          <input type="text" className={style['search-input']} placeholder="Search..."
            onKeyUp={ (e) => setFilter(e.target.value) }
            />
        </div>
        {renderTree(filteredTree, '', 0) }
      </div>);
}));
