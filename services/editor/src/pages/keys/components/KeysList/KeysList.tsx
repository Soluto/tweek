import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as R from 'ramda';
import React, { useEffect, useState } from 'react';
import { useAllKeys } from '../../../../contexts/AllKeys';
import * as SearchService from '../../../../services/search-service';
import { useEnableCardsView, useMaxSearchResults, useShowInternalKeys } from '../../../../utils';
import CardView from './CardView';
import './KeysList.css';
import DirectoryTreeView from './TreeView/DirectoryTreeView';

type KeysFilterProps = {
  filter: string;
  onFilterChange: (filter: string) => void;
};

const KeysFilter = ({ filter, onFilterChange }: KeysFilterProps) => (
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

export type KeysListProps = {
  selectedKey?: string;
};

const KeysList = ({ selectedKey }: KeysListProps) => {
  const supportMultiResultsView = useEnableCardsView();
  const showInternalKeys = useShowInternalKeys();
  const maxSearchResults = useMaxSearchResults();
  const keys = useAllKeys();

  const visibleKeys = SearchService.filterInternalKeys(
    R.filter((key) => !key.meta.archived, keys),
    showInternalKeys,
  );

  const [resultsView, setResultsView] = useState('cards');
  const [filter, setFilter] = useState('');
  const [filteredKeys, setFilteredKeys] = useState<string[]>();

  const trimmedFilter = filter.trim();

  useEffect(() => {
    if (!trimmedFilter) {
      setFilteredKeys(undefined);
      return;
    }

    let cancel = false;
    const timeout = setTimeout(async () => {
      const results = await SearchService.search(trimmedFilter, maxSearchResults);
      !cancel && setFilteredKeys(results);
    }, 500);

    return () => {
      cancel = true;
      clearTimeout(timeout);
    };
  }, [trimmedFilter]); //eslint-disable-line react-hooks/exhaustive-deps

  return (
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
  );
};

export default KeysList;
