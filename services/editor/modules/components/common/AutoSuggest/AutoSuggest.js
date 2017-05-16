import React, { Component, PropTypes } from 'react';
import { AsyncTypeahead } from 'react-bootstrap-typeahead';
import style from './AutoSuggest.css';

class AutoSuggest extends Component {
  constructor(props) {
    super(props);
    this.state = {
      suggestions: [],
    };
  }

  onSearch(query) {
    Promise.resolve(this.props.getSuggestions(query))
      .then(suggestions => this.setState({ suggestions }));
  }

  onChange(selectedValues) {
    const { onChange } = this.props;
    onChange(selectedValues[0]);
  }

  render() {
    const { onChange, value, className, ...props } = this.props;
    const { suggestions } = this.state;

    return (
      <div className={className}>
        <AsyncTypeahead
          {...props}
          onSearch={(...args) => this.onSearch(...args)}
          onChange={(...args) => this.onChange(...args)}
          onInputChange={onChange}
          options={suggestions}
          filterBy={() => true}
          selected={value === undefined ? [] : [value]}
        />
      </div>
    );
  }
}

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
