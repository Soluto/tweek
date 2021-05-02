import classNames from 'classnames';
import * as R from 'ramda';
import React, { useState } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { withTweekValues } from 'react-tweek';
import { componentFromStream, compose, createEventHandler, setDisplayName } from 'recompose';
import { Observable } from 'rxjs';
import * as SearchService from '../../../../services/search-service';
import { getTagLink } from '../../utils/search';
import CardView from './CardView';
import './KeysList.css';
import DirectoryTreeView from './TreeView/DirectoryTreeView';

const KeysFilter = ({ onFilterChange }) => {
  const [filter, setFilter] = useState('');
  return (
    <div className="search-input-wrapper">
      <div style={{ position: 'relative' }}>
        <input
          data-comp="search-key-input"
          type="text"
          className="search-input"
          placeholder="Search..."
          value={filter}
          onChange={(e) => {
            setFilter(e.target.value);
            onFilterChange(e.target.value);
          }}
        />
        {filter !== '' && (
          <button
            className="clear"
            onClick={(e) => {
              setFilter('');
              onFilterChange('');
            }}
          >
            X
          </button>
        )}
      </div>
    </div>
  );
};

const getDataValueType = (archived, keyType, valueType) => {
  if (archived) {
    return 'archived';
  } else if (keyType === 'alias') {
    return 'alias';
  }
  return valueType || 'key';
};

const KeyItem = ({ name, fullPath, depth, selected, item }) => {
  const dataValueType = getDataValueType(
    item.meta.archived,
    item.implementation.type,
    item.valueType,
  );
  return (
    <div className="key-link-wrapper" data-comp="key-link">
      <Link
        title={fullPath}
        className={classNames('key-link', { selected })}
        style={{ paddingLeft: (depth + 1) * 10 }}
        to={`/keys/${fullPath}`}
      >
        <div className={classNames('key-type', 'key-icon')} data-value-type={dataValueType} />
        <span>{name}</span>
      </Link>
    </div>
  );
};

const CardItem = ({
  key_path,
  meta: { archived, name, tags, description },
  implementation: { keyType },
  valueType,
  selected,
}) => (
  <div className={classNames('key-card', { selected })} data-comp="key-card">
    <Link title={key_path} className="key-link" to={`/keys/${key_path}`}>
      <div>
        <div
          className={classNames('key-type', 'card-icon')}
          data-value-type={getDataValueType(archived, keyType, valueType)}
        />
        <div className="title">{name}</div>
        <div>
          {(tags || []).map((x) => (
            <Link className="tag" to={getTagLink(x)}>
              {x}
            </Link>
          ))}
        </div>
      </div>
      <div className="path">{key_path}</div>
      <div className="description">{description}</div>
    </Link>
  </div>
);

const enhance = compose(
  connect((state) => ({ selectedKey: state.selectedKey && state.selectedKey.key })),
  withTweekValues(
    {
      supportMultiResultsView: '@tweek/editor/experimental/keys_search/enable_cards_view',
      maxSearchResults: '@tweek/editor/search/max_results',
      showInternalKeys: '@tweek/editor/show_internal_keys',
    },
    {
      defaultValues: {},
    },
  ),
  setDisplayName('KeysList'),
);

const KeysList = enhance(
  componentFromStream((prop$) => {
    const supportMultiResultsView$ = prop$.pluck('supportMultiResultsView').distinctUntilChanged();

    const keyList$ = prop$
      .distinctUntilChanged(
        (x, y) => x.showInternalKeys === y.showInternalKeys && x.keys === y.keys,
      )
      .map(({ keys: allKeys, showInternalKeys }) => {
        const unarchivedKeys = R.filter((key) => !key.meta.archived, allKeys);
        return {
          keys: allKeys,
          visibleKeys: SearchService.filterInternalKeys(unarchivedKeys, showInternalKeys),
        };
      });

    const { handler: setFilter, stream: filter$ } = createEventHandler();
    const { handler: setResultsView, stream: resultsView$ } = createEventHandler();

    const filteredKeys$ = filter$
      .map((x) => x.trim())
      .distinctUntilChanged()
      .debounceTime(500)
      .startWith('')
      .withLatestFrom(prop$.pluck('maxSearchResults'))
      .switchMap(async ([filter, maxResults]) =>
        filter === '' ? undefined : SearchService.search(filter, maxResults),
      )
      .startWith(undefined);

    return Observable.combineLatest(
      prop$.map((x) => x.selectedKey).distinctUntilChanged(),
      filteredKeys$,
      keyList$,
      supportMultiResultsView$,
      resultsView$.startWith('cards'),
    ).map(
      ([
        selectedKey,
        filteredKeys,
        { visibleKeys, keys },
        supportMultiResultsView,
        resultsView,
      ]) => (
        <div className="keys-list-container">
          <KeysFilter onFilterChange={setFilter} />
          {filteredKeys && supportMultiResultsView && (
            <div className="view-selector">
              <button onClick={() => setResultsView('cards')}>List</button>
              <button onClick={() => setResultsView('tree')}>Tree</button>
            </div>
          )}
          <div className="keys-nav">
            <div className="search-results">
              {filteredKeys && supportMultiResultsView && resultsView === 'cards' ? (
                <CardView
                  itemSelector={(x) => x && x.key_path}
                  selectedItem={selectedKey}
                  items={filteredKeys.map((x) => keys[x]).filter((x) => x)}
                  renderItem={CardItem}
                />
              ) : (
                <DirectoryTreeView
                  selectedPath={selectedKey}
                  paths={filteredKeys || Object.keys(visibleKeys)}
                  expandByDefault={!!filteredKeys}
                  renderItem={(x) => <KeyItem {...x} item={keys[x.fullPath]} />}
                />
              )}
            </div>
          </div>
        </div>
      ),
    );
  }),
);

export default KeysList;
