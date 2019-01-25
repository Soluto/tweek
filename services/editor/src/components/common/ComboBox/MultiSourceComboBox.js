import React from 'react';
import PropTypes from 'prop-types';
import { Observable } from 'rxjs';
import * as R from 'ramda';
import { compose, createEventHandler, mapPropsStream, setDisplayName } from 'recompose';
import classnames from 'classnames';
import ComboBox from './ComboBox';

import './MultiSourceComboBox.css';
import { withTweekKeys } from '../../../contexts/Tweek';

const SourceTitle = ({ id, onSourceId, sourceId }) => (
  <div
    onClick={() => onSourceId(id)}
    disabled={id === sourceId}
    className={classnames('source-item', { active: id === sourceId })}
  >
    {id === undefined ? 'All' : id}
  </div>
);

function getAllSuggestions(getSuggestions) {
  return function (...args) {
    const suggestionPromises = Object.values(getSuggestions).map(fn => fn(...args));

    return Promise.all(suggestionPromises).then(R.flatten);
  };
}

const enhance = compose(
  withTweekKeys({
    maxSearchResults: '@tweek/editor/search/max_results',
    showInternalKeys: '@tweek/editor/show_internal_keys',
  }),
  setDisplayName('MultiSourceComboBox'),
  mapPropsStream((props$) => {
    const { handler: onSearch, stream: onSearch$ } = createEventHandler();
    const { handler: onSourceId, stream: onSourceId$ } = createEventHandler();

    const query$ = Observable.merge(onSearch$, props$.pluck('value'))
      .debounce(query => Observable.empty().delay(query === '' ? 0 : 500))
      .distinctUntilChanged();

    const sourceId$ = onSourceId$
      .startWith(undefined)
      .distinctUntilChanged()
      .publishReplay(1)
      .refCount();

    const suggestions$ = Observable.combineLatest(query$, sourceId$)
      .withLatestFrom(
        props$,
        ([query, sourceId], { getSuggestions, maxSearchResults, showInternalKeys }) => [
          query,
          getSuggestions[sourceId] || getAllSuggestions(getSuggestions),
          { maxSearchResults, showInternalKeys },
        ],
      )
      .switchMap(([query, getSuggestions, searchOptions]) =>
        Observable.defer(() => Promise.resolve(getSuggestions(query, searchOptions))),
      )
      .startWith([]);

    return Observable.combineLatest(props$, sourceId$, suggestions$).map(
      ([{ getSuggestions, onChange, ...props }, sourceId, suggestions]) => ({
        ...props,
        suggestions,
        onChange: (txt, ...args) => {
          onSearch(txt);
          if (onChange) onChange(txt, ...args);
        },
        suggestionsContainer: ({ children }) => (
          <div className={'multi-source-combo-box-suggestions'}>
            <div className={'source-select'}>
              <SourceTitle {...{ sourceId, onSourceId }} />
              {Object.keys(getSuggestions).map(key => (
                <SourceTitle id={key} {...{ key, sourceId, onSourceId }} />
              ))}
            </div>
            <ul
              className="bootstrap-typeahead-menu dropdown-menu dropdown-menu-justify"
              style={{
                display: 'block',
                overflow: 'auto',
                maxHeight: '300px',
                position: 'relative',
              }}
            >
              {children.length > 0 ? children : 'Not found...'}
            </ul>
          </div>
        ),
      }),
    );
  }),
);

const MultiSourceComboBox = enhance(ComboBox);

MultiSourceComboBox.propTypes = {
  getSuggestions: PropTypes.objectOf(PropTypes.func).isRequired,
};

export default MultiSourceComboBox;
