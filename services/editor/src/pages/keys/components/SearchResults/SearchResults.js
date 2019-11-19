import React, { useState, useEffect } from 'react';
import * as R from 'ramda';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import * as SearchService from '../../../../services/search-service';

const useSearchResults = (query) => {
  const [searchResults, setSearchResults] = useState(null);
  useEffect(() => {
    SearchService.search(query, { maxResults: 30, type: 'free' }).then(setSearchResults);
  }, [query]);

  return searchResults;
};

const getDataValueType = (archived, keyType, valueType) => {
  if (archived) {
    return 'archived';
  } else if (keyType === 'alias') {
    return 'alias';
  }
  return valueType || 'key';
};

function searchResult({
  key_path,
  meta: { archived, name, tags, description },
  implementation: { keyType },
  valueType,
}) {
  return (
    <div data-comp="search-result">
      <Link title={key_path} to={`/keys/${key_path}`}>
        <div>
          <div data-value-type={getDataValueType(archived, keyType, valueType)} />
          <div className="title">{name}</div>
          <div>
            {(tags || []).map((x) => (
              <span className="tag">{x}</span>
            ))}
          </div>
        </div>
        <div className="path">{key_path}</div>
        <div className="description">{description}</div>
      </Link>
    </div>
  );
}

export default function SearchResults({
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
          {(results && results.map((x) => keys[x]).map((x) => searchResult(x))) || 'loading'}
        </div>
      </div>
    </>
  );
}
