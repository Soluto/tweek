import React from 'react';
import { Link } from 'react-router';
import style from './KeysList.css';
import { pure } from 'recompose';
import wrapComponentWithClass from '../../../../utils/wrapComponentWithClass';

let leaf = Symbol();
let getName = (path) => path.split('/').slice(-1)[0];

function renderTree(tree, currentPath, pad) {
  return tree === leaf ?
    (<div className={style['key-link-wrapper']}>
      <Link className={style['key-link']}
        style={{ paddingLeft: pad }}
        to={`/keys${currentPath}`}>{getName(currentPath) }
      </Link>
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
              {renderTree(tree[key], `${currentPath}/${key}`, pad + 10) }
            </li>
          )) }
        </ul>

      </div >
    );
}

export default wrapComponentWithClass(pure(({ keys }) => {
  let tree = {};
  keys.map(x => x.split('/'))
    .forEach(fragments => {
      let last = fragments.pop();
      fragments.reduce((node, frag) => node[frag] = node[frag] || {}, tree)[last] = leaf;
    });

  return renderTree(tree, '', 0);
}));
