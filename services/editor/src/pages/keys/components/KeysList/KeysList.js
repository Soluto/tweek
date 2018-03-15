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

const supportCardView = async () => {
  try {
    const response = await fetch(
      `/api/editor-configuration/experimental/keys_search/enable_cards_view`,
    );
    return await response.json();
  } catch (err) {
    console.warn('failed to retrieve configuration for enable_cards_view', err);
    return false;
  }
};

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
    <Link title={key_path} className="key-link" to={`/keys/${key_path}`}>
      <div>
        <div className="title">{name}</div>
        <div>{(tags || []).map(x => <span className="tag">{x}</span>)}</div>
      </div>
      <div className="path">{key_path}</div>
      <div className="description">{description}</div>
    </Link>
  </div>
));

const KeysList = componentFromStream((prop$) => {
  const supportMultiResultsView$ = Observable.defer(supportCardView);

  const keyList$ = prop$
    .map(x => x.keys)
    .distinctUntilChanged()
    .switchMap(async (allKeys) => {
      const unarchivedKeys = R.filter(key => !key.meta.archived, allKeys);
      return { keys: allKeys, visibleKeys: await SearchService.filterInternalKeys(unarchivedKeys) };
    });

  const { handler: setFilter, stream: filter$ } = createEventHandler();
  const { handler: setResultsView, stream: resultsView$ } = createEventHandler();

  const filteredKeys$ = filter$
    .map(x => x.trim())
    .distinctUntilChanged()
    .debounceTime(500)
    .startWith('')
    .switchMap(async filter => (filter === '' ? undefined : SearchService.search(filter)));

  return Observable.combineLatest(
    filteredKeys$,
    keyList$,
    supportMultiResultsView$,
    resultsView$.startWith('cards'),
  ).map(([filteredKeys, { visibleKeys, keys }, supportMultiResultsView, resultsView]) => (
    <div className="keys-list-container">
      <KeysFilter onFilterChange={setFilter} />
      {filteredKeys &&
        supportMultiResultsView && (
          <div class="view-selector">
            <button onClick={() => setResultsView('cards')}>List</button>
            <button onClick={() => setResultsView('tree')}>Tree</button>
          </div>
        )}
      <div class="keys-nav">
        <div class="search-results">
          {filteredKeys && supportMultiResultsView && resultsView === 'cards' ? (
            <CardView items={filteredKeys.map(x => keys[x]).filter(x => x)} renderItem={CardItem} />
          ) : (
            <DirectoryTreeView
              paths={filteredKeys || Object.keys(visibleKeys)}
              expandByDefault={!!filteredKeys}
              renderItem={KeyItem}
            />
          )}
        </div>
      </div>
    </div>
  ));
});

KeysList.displayName = 'KeysList';

export default KeysList;
