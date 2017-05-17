import React, { Component, PropTypes } from 'react';
import Rx from 'rxjs';
import { AsyncTypeahead } from 'react-bootstrap-typeahead';
import style from './AutoSuggest.css';

class AutoSuggest extends Component {
  constructor(props) {
    super(props);

    this.state = {
      suggestions: [],
    };
  }

  componentWillMount() {
    this.onSearch$ = new Rx.Subject();
    this.onSearch$
      .debounceTime(500)
      .switchMap(query => Promise.resolve(this.props.getSuggestions(query)))
      .subscribe(suggestions => this.setState({ suggestions }));
  }

  componentWillUnmount() {
    this.onSearch$.complete();
  }

  render() {
    const { suggestions } = this.state;
    const { onChange, value, className, ...props } = this.props;

    return (
      <div className={className}>
        <AsyncTypeahead
          {...props}
          onSearch={query => this.onSearch$.next(query)}
          onChange={selectedValues => onChange(selectedValues[0])}
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
