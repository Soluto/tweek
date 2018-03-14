import React from 'react';
import * as R from 'ramda';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Observable } from 'rxjs';
import { componentFromStream, createEventHandler } from 'recompose';
import * as SearchService from '../../../../services/search-service';
import DirectoryTreeView from './DirectoryTreeView';
import CardView from './CardView';
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
}))(({ name, fullPath, depth, isActive }) => (
  <div className="key-link-wrapper" data-comp="key-link">
    <Link
      className={classNames('key-link', { selected: isActive })}
      style={{ paddingLeft: (depth + 1) * 14 }}
      to={`/keys/${fullPath}`}
    >
      {name}
    </Link>
  </div>
));

const CardItem = connect((state, props) => ({
  isActive: state.selectedKey && state.selectedKey.key && state.selectedKey.key === props.key_path,
}))(({ key_path, meta: { name, tags, description }, valueType, isActive }) => (
  <div className={classNames('key-card', { selected: isActive })} data-comp="key-card">
    <Link className="key-link" to={`/keys/${key_path}`}>
      <div className="title">
        {name} {(tags || []).map(x => <span className="tag">{x}</span>)}
      </div>
      <div className="path">{key_path}</div>
      <div className="description">{description}</div>
    </Link>
  </div>
));

const KeysList = componentFromStream((prop$) => {
  const keyList$ = prop$
    .map(x => x.keys)
    .distinctUntilChanged()
    .switchMap(async (allKeys) => {
      const unarchivedKeys = R.filter(key => !key.meta.archived, allKeys);
      return { keys: allKeys, visibleKeys: await SearchService.filterInternalKeys(unarchivedKeys) };
    });

  const { handler: setFilter, stream: filter$ } = createEventHandler();
  const filteredKeys$ = filter$
    .map(x => x.trim())
    .distinctUntilChanged()
    .debounceTime(500)
    .startWith('')
    .switchMap(async filter => (filter === '' ? undefined : SearchService.search(filter)));

  return Observable.combineLatest(filteredKeys$, keyList$).map(
    ([filteredKeys, { visibleKeys, keys }]) => (
      <div className="keys-list-container">
        <KeysFilter onFilterChange={setFilter} />
        {filteredKeys ? (
          <CardView items={filteredKeys.map(x => keys[x]).filter(x => x)} renderItem={CardItem} />
        ) : (
          <DirectoryTreeView paths={Object.keys(visibleKeys)} renderItem={KeyItem} />
        )}
      </div>
    ),
  );
});

KeysList.displayName = 'KeysList';

export default KeysList;
