import React, { useState, useEffect } from 'react';
import * as R from 'ramda';
import { Link } from 'react-router-dom';
import {
  componentFromStream,
  compose,
  createEventHandler,
  setDisplayName,
  withState,
} from 'recompose';
import { useSelector } from 'react-redux';
import * as SearchService from '../../../../services/search-service';

const useSearchResults = (query) => {
  const [searchResults, setSearchResults] = useState(null);
  useEffect(() => SearchService.search(query, 30).then(setSearchResults), [query]);

  return searchResults;
};

export function SearchResults({
  match: {
    params: { query },
  },
}) {
  const results = useSearchResults(query);
  const keys = useSelector((x) => x.keys);

  return (
    <>
      <div>
        <div>
          <h1>Showing results for </h1>
        </div>
        <div>
          {(results && results.map((x) => <div>{JSON.stringify(keys[x])}</div>)) || 'loading'}
        </div>
      </div>
    </>
  );
}

export default SearchResults;
