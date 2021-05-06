import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as R from 'ramda';
import React from 'react';
import { connect } from 'react-redux';
import { withTweekValues } from 'react-tweek';
import { componentFromStream, compose, createEventHandler, setDisplayName } from 'recompose';
import { Observable } from 'rxjs';
import * as SearchService from '../../../../services/search-service';
import CardView from './CardView';
import './KeysList.css';
import DirectoryTreeView from './TreeView/DirectoryTreeView';

const KeysFilter = ({ filter, onFilterChange }) => (
  <div className="search-input-wrapper">
    <div style={{ position: 'relative' }}>
      <input
        data-comp="search-key-input"
        type="text"
        className="search-input"
        placeholder="Search..."
        value={filter}
        onChange={(e) => onFilterChange(e.target.value)}
      />
      {filter && (
        <div className="clear-wrapper">
          <button className="clear" onClick={() => onFilterChange('')}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
      )}
    </div>
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
      filter$.startWith(''),
    ).map(
      ([
        selectedKey,
        filteredKeys,
        { visibleKeys, keys },
        supportMultiResultsView,
        resultsView,
        filter,
      ]) => (
        <div className="keys-list-container">
          <KeysFilter filter={filter} onFilterChange={setFilter} />
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
                />
              ) : (
                <DirectoryTreeView
                  selectedPath={selectedKey}
                  paths={filteredKeys || Object.keys(visibleKeys)}
                  expandByDefault={!!filteredKeys}
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
