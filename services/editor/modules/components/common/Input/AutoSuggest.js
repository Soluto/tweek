import React, { Component, PropTypes } from 'react';
import { createEventHandler, componentFromStream } from 'recompose';
import { AsyncTypeahead } from 'react-bootstrap-typeahead';
import style from './AutoSuggest.css';

const AutoSuggest = componentFromStream((props$) => {
  const { handler: onSearch, stream: onSearch$ } = createEventHandler();
  const suggestions$ = props$.combineLatest(onSearch$, ({ getSuggestions }, query) => ({ getSuggestions, query }))
    .distinctUntilChanged(x => x.query)
    .debounceTime(500)
    .switchMap(({ getSuggestions, query }) => Promise.resolve(getSuggestions(query)))
    .startWith([]);

  return props$.combineLatest(
    suggestions$,
    ({ onChange, value, className, ...props }, suggestions) => (
      <div className={className}>
        <AsyncTypeahead
          {...props}
          onSearch={onSearch}
          onChange={selectedValues => onChange(selectedValues[0])}
          onInputChange={onChange}
          options={suggestions}
          filterBy={() => true}
          selected={value === undefined ? [] : [value]}
        />
      </div>
  ));
});

AutoSuggest.propTypes = {
  value: PropTypes.any,
  getSuggestions: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  className: PropTypes.string,
};

AutoSuggest.defaultProps = {
  value: undefined,
  className: style['autosuggest-default-wrapper-theme-class'],
};

export default AutoSuggest;
