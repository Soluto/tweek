import React from 'react';
import classNames from 'classnames';
import TreeDirectoryView from './TreeDirectoryView';
import { connect } from "react-redux";
import { Link } from 'react-router';
import { Observable } from 'rxjs/Rx';
import { componentFromStream, createEventHandler } from 'recompose';

import style from './KeysList.css';

function KeysFilter ({onFilterChange}) {
  return (
    <div className={style['search-input-wrapper']}>
      <input type="text" className={style['search-input']} placeholder="Search..." onKeyUp={e => onFilterChange(e.target.value)} />
    </div>
  );
}

const KeyItem = connect((state, props) => ({ isActive: state.selectedKey && state.selectedKey.key && state.selectedKey.key === props.fullPath }))
(({name, fullPath, depth, isActive}) => (
  <div className={classNames(style['key-link-wrapper'])}>
    <Link className={classNames(style['key-link'], { [style['selected']]: isActive }) }
          style={{ paddingLeft: (depth + 1) * 14 }}
          to={`/keys/${fullPath}`}>
      {name}
    </Link>
  </div>
));

const KeysList = componentFromStream(prop$ => {
  const keyList$ = prop$.map(x => x.keys).distinctUntilChanged();

  const { handler: setFilter, stream: filter$ } = createEventHandler();
  const textFilter$ = filter$.debounceTime(500).startWith('');

  return Observable
    .combineLatest(textFilter$, keyList$)
    .map(([filter, keys]) => {
      let filteredKeys = keys.filter(key => key.toLowerCase().includes(filter.toLowerCase()));

      return (
        <div className={style['keys-list-container']}>
          <KeysFilter onFilterChange={setFilter} />
          <TreeDirectoryView paths={filteredKeys} renderItem={KeyItem} expandByDefault={!!filter} />
        </div>
      );
    });
});

export default KeysList;