import React, { PropTypes } from 'react';
import { withState } from 'recompose';
import { AsyncTypeahead } from 'react-bootstrap-typeahead';
import style from './AutoSuggest.css';

const AutoSuggest = ({ suggestions, setSuggestions, getSuggestions, onChange, value, className, ...props }) => (
  <div className={className}>
    <AsyncTypeahead
      {...props}
      onSearch={query => Promise.resolve(getSuggestions(query)).then(setSuggestions)}
      onChange={selectedValues => onChange(selectedValues[0])}
      onInputChange={onChange}
      options={suggestions}
      filterBy={() => true}
      selected={value === undefined ? [] : [value]}
    />
  </div>
);

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

export default withState('suggestions', 'setSuggestions')(AutoSuggest);
