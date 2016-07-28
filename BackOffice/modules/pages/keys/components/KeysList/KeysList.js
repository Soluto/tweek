import React from 'react';
import { Link } from 'react-router';
import style from './KeysList.css';
import { pure } from 'recompose';
import wrapComponentWithClass from '../../../../utils/wrapComponentWithClass';

let leaf = Symbol();
let getName = (path) => path.split('/').slice(-1)[0];

function renderTree(tree, currentPath) {
  return tree === leaf ?
    (<Link to={`/keys${currentPath}`}>{getName(currentPath) }</Link>) : (
      <div className={style['tree-level']}>
        {getName(currentPath) }
        <ul>
          {Object.keys(tree).map(key => (
            <li key={key}>
              {renderTree(tree[key], `${currentPath}/${key}`) }
            </li>
          )) }
        </ul>
      </div>
    );
}

export default wrapComponentWithClass(pure(({ keys }) => {
  let tree = {};
  keys.map(x => x.split('/'))
    .forEach(fragments => {
      let last = fragments.pop();
      fragments.reduce((node, frag) => node[frag] = node[frag] || {}, tree)[last] = leaf;
    });

  return renderTree(tree, '');
}));
