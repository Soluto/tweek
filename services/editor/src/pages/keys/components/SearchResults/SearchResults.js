import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import styled from '@emotion/styled';
import * as SearchService from '../../../../services/search-service';
import { getTagLink } from '../../utils/search';

const useSearchResults = (query) => {
  const [searchResults, setSearchResults] = useState(null);
  useEffect(() => {
    SearchService.search(query, { maxResults: 100, type: 'free' }).then(setSearchResults);
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
  display: block;
  overflow-y: scroll;
  flex: 1;
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
  a {
    color: inherit;
    text-decoration: none;
  }
  padding: 10px;
  margin: 20px 0;
  overflow: hidden;
  text-decoration: none;
  border: 1px solid lightgray;
  border-radius: 5px;
  .title {
    font-size: 20px;
    color: #515c66;
    text-overflow: ellipsis;
    white-space: nowrap;
    display: inline-block;
    margin-right: 10px;
  }
  .tags {
    display: inline-block;
  }
  .tag {
    font-size: 14px;
    border-radius: 10px;
    background-color: green;
    display: inline-block;
    padding: 4px;
    margin: 0 2px;
    color: white;
    vertical-align: middle;
  }
  .path {
    margin-top: 4px;
    font-size: 14px;
    color: #a5a5a5;
  }
  .description {
    color: #515c66;
    font-size: 14px;
    text-overflow: ellipsis;
    margin-top: 4px;
    max-width: fit-content;
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
          <div className="tags">
            {(tags || []).map((x) => (
              <Link to={getTagLink(x)}>
                <span className="tag">{x}</span>
              </Link>
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
          {(results &&
            results
              .map((x) => keys[x])
              .filter((x) => x)
              .map((x) => searchResult(x))) ||
            'loading'}
        </div>
      </SearchResultsContainer>
    </>
  );
}
