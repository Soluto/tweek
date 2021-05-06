import styled from '@emotion/styled';
import { uniqBy } from 'ramda';
import React, { KeyboardEventHandler, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import * as SearchService from '../../../../services/search-service';
import { StoreState } from '../../../../store/ducks/types';
import { getTagLink } from '../../utils/search';

function filterWithLimit<T>(collection: T[], filter: (i: T) => boolean, limit = 2) {
  return Array.from(
    (function* generate() {
      let i = 0;
      for (let item of collection) {
        if (i >= limit) {
          break;
        }
        if (filter(item)) {
          yield item;
          i++;
        }
      }
    })(),
  );
}

const SearchInput = styled.input`
  display: inline-block;
  width: 600px;
  font-size: 26px;
  font-weight: 500;
  color: #515c66;
  outline: none;
  box-sizing: border-box;
  transition: all 0.2s ease-in-out;
  background-image: url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+PHN2ZyB3aWR0aD0iNDhweCIgaGVpZ2h0PSI0OHB4IiB2aWV3Qm94PSIwIDAgNDggNDgiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+ICAgICAgICA8dGl0bGU+U2VhcmNoIEljb24gPC90aXRsZT4gICAgPGRlc2M+Q3JlYXRlZCB3aXRoIFNrZXRjaC48L2Rlc2M+ICAgIDxkZWZzPjwvZGVmcz4gICAgPGcgaWQ9IlR3ZWVrLWljb25zIiBzdHJva2U9Im5vbmUiIHN0cm9rZS13aWR0aD0iMSIgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPiAgICAgICAgPGcgaWQ9IlNlYXJjaC1JY29uLSIgc3Ryb2tlPSIjNjk2OTY5IiBzdHJva2Utd2lkdGg9IjIiPiAgICAgICAgICAgIDxnIGlkPSJTZWFyY2gtaWNvbiIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMTUuMDAwMDAwLCAxNS4wMDAwMDApIj4gICAgICAgICAgICAgICAgPHBhdGggZD0iTTE0LjMwNjcsNy4zNjg1OTM1IEMxNC4zMDY3LDExLjQzODUwNzEgMTEuMTAzNywxNC43MzY4NzggNy4xNTM3LDE0LjczNjg3OCBDMy4yMDI3LDE0LjczNjg3OCAtMC4wMDAzLDExLjQzODUwNzEgLTAuMDAwMyw3LjM2ODU5MzUgQy0wLjAwMDMsMy4yOTg2Nzk5IDMuMjAyNywwLjAwMDMwOTAyOTEyNiA3LjE1MzcsMC4wMDAzMDkwMjkxMjYgQzExLjEwMzcsMC4wMDAzMDkwMjkxMjYgMTQuMzA2NywzLjI5ODY3OTkgMTQuMzA2Nyw3LjM2ODU5MzUgTDE0LjMwNjcsNy4zNjg1OTM1IFoiIGlkPSJTdHJva2UtMSI+PC9wYXRoPiAgICAgICAgICAgICAgICA8cGF0aCBkPSJNMTcuMDcxNiwxNy40OTk1OTgzIEwxMi4zODk2LDEyLjY3NjY4MzgiIGlkPSJTdHJva2UtMyI+PC9wYXRoPiAgICAgICAgICAgIDwvZz4gICAgICAgIDwvZz4gICAgPC9nPjwvc3ZnPg==);
  background-repeat: no-repeat;
  background-position-y: center;
  border-radius: 100px;
  border: none;
  background-color: #ffffff;
  padding: 10px 8px 10px 40px;
`;

const SearchResults = styled.ul`
  background-color: white;
  margin-top: 10px;
  border-radius: 10px;
  width: 600px;
  color: #515c66;

  li {
    list-style: none;
  }

  a {
    display: block;

    transition: all 0.2s ease-in-out;
    padding: 10px;
    color: inherit;
    text-decoration: none;
  }

  li:hover,
  li[data-hovered='true'] {
    color: white;
    background-color: #363a3e;
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
`;

type SearchResultProps = {
  type: 'tag' | 'key' | 'search';
  link: string;
  id: string;
};

const SearchResult = ({ type, link, id }: SearchResultProps) => {
  if (type === 'tag') {
    return (
      <Link to={link}>
        {' '}
        By tag <span className="tag">{id}</span>{' '}
      </Link>
    );
  }
  if (type === 'key') {
    return <Link to={link}> {id} </Link>;
  }
  if (type === 'search') {
    return <Link to={link}> Show all results for {id}</Link>;
  }
  return null;
};

export type QuickNavigationProps = Pick<StoreState, 'keys' | 'tags'> & {
  onBlur?: () => void;
  push: (path: string) => void;
};

const QuickNavigation = ({ keys, tags, onBlur, push }: QuickNavigationProps) => {
  const [input, onInput] = useState('');
  const [index, setIndex] = useState(-1);
  const [results, setResults] = useState<SearchResultProps[]>([]);

  useEffect(() => {
    if (!input) {
      setResults([]);
      return;
    }

    let cancel = false;
    const timeout = setTimeout(async () => {
      const filteredSearch = await SearchService.search(`id:${input}*`, { count: 2, type: 'free' });

      if (cancel) {
        return;
      }

      setResults(
        uniqBy((x) => x.link, [
          ...filterWithLimit(Object.values(keys), (k) => k.key_path?.startsWith(input)).map(
            (x) => ({
              type: 'key' as const,
              id: x.key_path,
              link: `/keys/${x.key_path}`,
            }),
          ),
          ...filterWithLimit(Object.values(tags), (t) => t?.toLowerCase().startsWith(input)).map(
            (x) => ({
              type: 'tag' as const,
              id: x,
              link: getTagLink(x),
            }),
          ),
          ...filteredSearch.map((x) => ({
            type: 'key' as const,
            id: x,
            link: `/keys/${x}`,
          })),
        ]),
      );
    }, 100);

    return () => {
      cancel = true;
      clearTimeout(timeout);
    };
  }, [input]); //eslint-disable-line react-hooks/exhaustive-deps

  const onKeyDown: KeyboardEventHandler = (e) => {
    // eslint-disable-next-line default-case
    switch (e.key) {
      case 'Escape':
        onBlur && onBlur();
        break;
      case 'Enter':
        push(results[index].link);
        break;
      case 'ArrowDown':
        setIndex((i) => i + 1);
        e.preventDefault();
        break;
      case 'ArrowUp':
        setIndex((i) => Math.max(-1, i - 1));
        e.preventDefault();
        break;
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        zIndex: 1000,
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0, 0.4)',
        paddingTop: 200,
      }}
    >
      <div>
        <SearchInput
          type="text"
          autoFocus
          onKeyDown={onKeyDown}
          onBlur={onBlur}
          value={input}
          onChange={(x) => onInput(x.target.value)}
        />
        <SearchResults>
          {results.map((r, i) => (
            <li key={`${r.type}-${r.id}`} data-hovered={index === i}>
              <SearchResult id={r.id} link={r.link} type={r.type} />
            </li>
          ))}
        </SearchResults>
      </div>
    </div>
  );
};

export default QuickNavigation;
