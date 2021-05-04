import React from 'react';
import * as SearchService from '../../../../services/search-service';
import { componentFromStream, createEventHandler } from 'recompose';
import { combineLatest } from 'rxjs';
import {
  switchMap,
  tap,
  take,
  map,
  startWith,
  scan,
  debounceTime,
  filter,
  withLatestFrom,
  switchMapTo,
} from 'rxjs/operators';
import { Link } from 'react-router-dom';
import { getTagLink, getSearchLink } from '../../utils/search';
import styled from '@emotion/styled';

function filterWithLimit(collection, filter, limit = 2) {
  return Array.from(
    (function* generate() {
      let i = 0;
      for (let item of collection) {
        if (i >= limit) break;
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
  padding: 10px 8px;
  background-color: transparent;
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
  padding-left: 40px;
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

const keyCode = {
  ENTER: 13,
  UP: 38,
  DOWN: 40,
};

function SearchResult({ type, link, id }) {
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
}

function SearchInputContainer({ onBlur, onInput, input, onKeyDown }) {
  return (
    <SearchInput
      type="text"
      autoFocus
      onKeyDown={onKeyDown}
      onBlur={onBlur}
      value={input}
      onChange={(x) => onInput(x.target.value)}
    />
  );
}

export default componentFromStream((props$) => {
  const { handler: onInput, stream: input$ } = createEventHandler();
  const { handler: onKeyDown, stream: onKeyDown$ } = createEventHandler();
  const results$ = input$
    .pipe(
      debounceTime(100),
      filter((x) => x.length > 0),
      withLatestFrom(
        props$.map((x) => ({ keys: Object.values(x.keys), tags: Object.values(x.tags) })),
      ),
      switchMap(async ([x, { keys, tags }]) => [
        ...filterWithLimit(keys, (k) => (k.key_path || '').startsWith(x)).map((x) => ({
          type: 'key',
          id: x.key_path,
          link: `/keys/${x.key_path}`,
        })),
        ...filterWithLimit(tags, (t) => (t || '').toLowerCase().startsWith(x)).map((x) => ({
          type: 'tag',
          id: x,
          link: getTagLink(x),
        })),
        ...(await SearchService.search(`id:${x}*`, { count: 2, type: 'free' })).map((x) => ({
          type: 'key',
          id: x,
          link: `/keys/${x}`,
        })),
        { type: 'search', id: x, link: getSearchLink(x) },
      ]),
    )
    .startWith([]);
  const index$ = input$.pipe(
    switchMapTo(
      onKeyDown$.pipe(
        filter((e) => e.keyCode === keyCode.DOWN || e.keyCode === keyCode.UP),
        tap((e) => e.preventDefault()),
        map((e) => {
          if (e.keyCode === keyCode.DOWN) {
            return 1;
          }
          if (e.keyCode === keyCode.UP) {
            return -1;
          }
        }),
        startWith(-1),
        scan((acc, next) => Math.max(-1, acc + next)),
      ),
    ),
    startWith(-1),
  );

  const submit$ = onKeyDown$.pipe(
    withLatestFrom(index$, results$),
    filter(([e, index, results]) => e.keyCode === keyCode.ENTER && results[index]),
    take(1),
    startWith(false),
  );

  return combineLatest(props$, input$.startWith(''), results$, index$, submit$).map(
    ([{ push, onBlur }, input, results, index, submit]) => {
      if (submit) {
        push({ pathname: results[index].link });
      }
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
            <SearchInputContainer
              value={input}
              onKeyDown={(x) => {
                onKeyDown(x);
              }}
              onInput={onInput}
              onBlur={onBlur}
            />
            <SearchResults index={-1}>
              {results.map((r, i) => (
                <li key={r.id} data-hovered={index === i}>
                  <SearchResult id={r.id} link={r.link} type={r.type} />
                </li>
              ))}
            </SearchResults>
          </div>
        </div>
      );
    },
  );
});