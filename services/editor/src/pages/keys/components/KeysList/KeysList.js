import React from 'react';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Observable } from 'rxjs';
import { componentFromStream, createEventHandler } from 'recompose';
import * as SearchService from '../../../../services/search-service';
import fetch from '../../../../utils/fetch';
import DirectoryTreeView from './DirectoryTreeView';
import './KeysList.css';

function KeysFilter({ onFilterChange }) {
  return (
    <div className="search-input-wrapper">
      <input
        data-comp="search-key-input"
        type="text"
        className="search-input"
        placeholder="Search..."
        onKeyUp={e => onFilterChange(e.target.value)}
      />
    </div>
  );
}

const KeyItem = connect((state, props) => ({
  isActive: state.selectedKey && state.selectedKey.key && state.selectedKey.key === props.fullPath,
}))(({ name, fullPath, depth, isActive }) =>
  <div className="key-link-wrapper" data-comp="key-link">
    <Link
      className={classNames('key-link', { selected: isActive })}
      style={{ paddingLeft: (depth + 1) * 14 }}
      to={`/keys/${fullPath}`}
    >
      {name}
    </Link>
  </div>,
);

const withoutInternal = list => (list ? list.filter(x => !/^@tweek\//.test(x)) : list);

const KeysList = componentFromStream((prop$) => {
  const showInternal$ = Observable.defer(() =>
    fetch('/api/editor-configuration/show_internal_keys').then(response => response.json()),
  );

  const keyList$ = Observable.combineLatest(
    prop$.map(x => x.keys).distinctUntilChanged(),
    showInternal$,
  ).map(([keys, show]) => (show ? keys : withoutInternal(keys)));

  const { handler: setFilter, stream: filter$ } = createEventHandler();
  const filteredKeys$ = filter$
    .map(x => x.trim())
    .distinctUntilChanged()
    .debounceTime(500)
    .startWith('')
    .switchMap(async filter => (filter === '' ? undefined : SearchService.search(filter)));

  return Observable.combineLatest(filteredKeys$, keyList$).map(([filteredKeys, keys]) =>
    <div className="keys-list-container">
      <KeysFilter onFilterChange={setFilter} />
      <DirectoryTreeView
        paths={filteredKeys || keys}
        renderItem={KeyItem}
        expandByDefault={!!filteredKeys}
      />
    </div>,
  );
});

KeysList.displayName = 'KeysList';

export default KeysList;
