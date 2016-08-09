import React from 'react';
import { Link } from 'react-router';
import style from './KeysList.css';
import wrapComponentWithClass from '../../../../utils/wrapComponentWithClass';
import { componentFromStream, createEventHandler } from 'recompose';
import { Observable } from 'rxjs/Rx';
import { connect } from 'react-redux';
import { compose, pure, mapProps } from 'recompose';
import classNames from 'classnames';

let leaf = Symbol();
let getName = (path) => path.split('/').slice(-1)[0];

const TreeKeyItem = compose(
  connect(state => ({ selectedKey: state.selectedKey && state.selectedKey.key })),
  mapProps(({ selectedKey, path, ...props }) => ({ isActive: selectedKey === path, path, ...props })),
  pure)(({ isActive, path, pad }) =>
  <Link className={classNames(style['key-link'], { [style['selected']]: isActive }) }
    style={{ paddingLeft: pad }}
    to={`/keys/${path}`}
  >{getName(path) }
  </Link>);

function renderTree(tree, currentPath, pad) {
  return tree === leaf ?
    (<div className={style['key-link-wrapper']}>
      <TreeKeyItem path={currentPath} pad={pad} />
    </div>)
    :
    (
      <div className={style['key-folder']}>
        {getName(currentPath) ? (
          <label style={{ paddingLeft: pad }} className={style['key-folder-name']}>{getName(currentPath) }</label>)
          :
          null}
        <ul>
          {Object.keys(tree).map(key => (
            <li key={key}>
              {renderTree(tree[key], currentPath === '' ? `${key}` : `${currentPath}/${key}`, pad + 10) }
            </li>
          )) }
        </ul>

      </div >
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
        <input type="text" className={style['filter-input']} placeholder="Search..."
          onKeyUp={ (e) => setFilter(e.target.value) }
        />
        {renderTree(filteredTree, '', 0) }
      </div>);
}));
