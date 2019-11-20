import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import * as SearchService from '../../../../services/search-service';
import styled from '@emotion/styled';

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

const SearchResultsContainer = styled.div`
  padding: 20px;
  h1 {
    color: #515c66;
    font-size: 28px;
    .query {
      color: #00506d;
      font-style: italic;
    }
  }
`;

const SearchResult = styled.div`
  background-color: white;
  padding: 10px;
  margin: 20px 0;
  text-decoration: none;

  .path {
    color: gray;
  }
`;

function searchResult({
  key_path,
  meta: { archived, name, tags, description },
  implementation: { keyType },
  valueType,
}) {
  return (
    <SearchResult data-comp="search-result">
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
    </SearchResult>
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
      <SearchResultsContainer>
        <div>
          <h1>
            Showing results for <span class="query">{query}</span>
          </h1>
        </div>
        <div>
          {(results && results.map((x) => keys[x]).map((x) => searchResult(x))) || 'loading'}
        </div>
      </SearchResultsContainer>
    </>
  );
}
