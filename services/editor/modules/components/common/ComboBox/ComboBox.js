import React, { Component, PropTypes } from 'react';
import Rx from 'rxjs';
import R from 'ramda';
import { compose, pure, mapPropsStream, createEventHandler } from 'recompose';
import classnames from 'classnames';
import ClickOutside from './ClickOutside';
import InputWithHint from './InputWithHint';
import Suggestions from './Suggestions';
import style from './ComboBox.css';

const keyCode = {
  ENTER: 13,
  UP: 38,
  RIGHT: 39,
  DOWN: 40,
  TAB: 9,
};

const compareBy = (...props) => (...args) => R.equals(...args.map(R.pick(props)));

const createCase = (matchCase, x) => {
  if (x === undefined || matchCase) return x;
  if (typeof x === 'function') {
    return (...args) => x(...args).toLowerCase();
  }
  return x.toLowerCase();
};

class ComboBoxComponent extends Component {
  onSuggestionSelected = (index) => {
    const { onChange, getLabel } = this.props;
    const selected = this.getSuggestion(index);
    onChange(getLabel(selected), selected);
  };

  onInputChange = (input) => {
    const { suggestions, getLabel, onChange, matchCase } = this.props;
    const caseInput = createCase(matchCase, input);
    const getLabelWithCase = createCase(matchCase, getLabel);
    const selected = suggestions.find(s => getLabelWithCase(s) === caseInput);
    onChange(input, selected);
  };

  getSuggestion = (index) => {
    const { suggestions } = this.props;
    return suggestions[Math.max(0, index)];
  };

  get hint() {
    const { value, hasFocus, highlightedSuggestion, suggestions, getLabel, matchCase } = this.props;
    if (!hasFocus) return '';
    const caseValue = createCase(matchCase, value);
    let suggestion;

    if (highlightedSuggestion === -1) {
      if (value === '') return '';
      suggestion = suggestions.map(getLabel).find(x => createCase(matchCase, x).startsWith(caseValue));
    } else {
      suggestion = suggestions[highlightedSuggestion];
    }
    suggestion = suggestion && getLabel(suggestion);
    const caseSuggestion = createCase(matchCase, suggestion);
    if (!suggestion || !caseSuggestion.startsWith(caseValue)) return '';
    return value + suggestion.substring(value.length);
  }

  handleKeyDown = (e) => {
    const { value, suggestions, highlightedSuggestion, onSuggestionHighlighted, onKeyDown, setFocus, getLabel } = this.props;

    switch (e.keyCode) {
      case (keyCode.TAB):
        if (suggestions.length > 0) {
          const selected = this.getSuggestion(highlightedSuggestion);
          if (getLabel(selected) !== value) {
            this.onSuggestionSelected(highlightedSuggestion);
            e.preventDefault();
            break;
          }
        }
        setFocus(false);
        break;
      case (keyCode.RIGHT):
      case (keyCode.ENTER):
        if (suggestions.length > 0) this.onSuggestionSelected(highlightedSuggestion);
        break;
      case (keyCode.DOWN):
        if (highlightedSuggestion < suggestions.length - 1) onSuggestionHighlighted(highlightedSuggestion + 1);
        else onSuggestionHighlighted(-1);
        e.preventDefault();
        break;
      case keyCode.UP:
        if (highlightedSuggestion === -1) onSuggestionHighlighted(suggestions.length - 1);
        else onSuggestionHighlighted(highlightedSuggestion - 1);
        e.preventDefault();
        break;
      default:
        break;
    }

    if (onKeyDown) onKeyDown(e);
  };

  render() {
    const {
      highlightedSuggestion,
      onSuggestionHighlighted,
      hasFocus,
      setFocus,

      value,
      suggestions,
      getLabel,
      className,
      disabled,
      renderSuggestion,

      matchCase,
      onChange,
      onKeyDown,
      ...props } = this.props;

    const hint = this.hint;

    return (
      <ClickOutside
        className={classnames(style['combo-box-default-wrapper-theme-class'], className)}
        onFocus={() => setFocus(true)}
        onClickOutside={() => setFocus(false)}
      >
        <div className="bootstrap-typeahead">
          <InputWithHint
            {...props}
            value={value}
            disabled={disabled}
            onChange={e => this.onInputChange(e.target.value)}
            showHint={hasFocus && (hint.length > 0 || value.length > 0)}
            hint={hint}
            onKeyDown={this.handleKeyDown}
          />
          { hasFocus && !disabled && suggestions.length > 0 ?
            <Suggestions
              {...{ value, suggestions, getLabel, highlightedSuggestion, onSuggestionHighlighted, renderSuggestion }}
              onSuggestionSelected={this.onSuggestionSelected}
            /> : null}
        </div>
      </ClickOutside>
    );
  }
}

const ComboBox = compose(
  mapPropsStream((props$) => {
    const { handler: onHighlighted, stream: onHighlighted$ } = createEventHandler();
    const { handler: setFocus, stream: onFocus$ } = createEventHandler();
    const { handler: onInputChanged, stream: onInputChanged$ } = createEventHandler();

    const highlighted$ = onHighlighted$.startWith({ index: -1 }).distinctUntilChanged();

    const value$ = Rx.Observable
      .merge(
        props$.map(({ value, getLabel }) => ({ input: getLabel(value), selected: value }))
          .distinctUntilChanged(R.equals)
          .map(x => ({ ...x, from: 'props' })),
        onInputChanged$
          .distinctUntilChanged(R.equals)
          .map(x => ({ ...x, from: 'state' })),
      )
      .scan((prev, current) => {
        if (current.input === '' && current.selected === undefined && prev.selected === undefined && current.from === 'props' && prev.from === 'state') {
          return prev;
        }
        return current;
      })
      .map(R.omit(['from']))
      .distinctUntilChanged(R.equals);

    const propsWithValue$ = Rx.Observable.combineLatest(props$, value$)
      .map(([props, { input: value }]) => ({ ...props, value })).share();

    const suggestions$ = propsWithValue$
      .distinctUntilChanged(compareBy('suggestions', 'value', 'showValueInOptions', 'matchCase'))
      .map(({ suggestions, filterBy, value, getLabel, showValueInOptions, matchCase }) => {
        const getCaseLabel = createCase(matchCase, getLabel);

        const filterFunc = filterBy || ((input, suggestion) => input === '' || getCaseLabel(suggestion).includes(createCase(matchCase, input)));

        const filteredSuggestions = suggestions.filter(s => filterFunc(value, s));
        if (!showValueInOptions && filteredSuggestions.length === 1 && getCaseLabel(filteredSuggestions[0]) === createCase(matchCase, value)) return [];
        return filteredSuggestions;
      })
      .withLatestFrom(highlighted$, (suggestions, highlighted) => ({ suggestions, highlighted }))
      .do(({ suggestions, highlighted }) => {
        if (highlighted.index === -1) return;
        const index = R.findIndex(R.equals(highlighted.suggestion))(suggestions);
        onHighlighted({ ...highlighted, index });
      })
      .map(R.prop('suggestions'));

    return Rx.Observable.combineLatest(propsWithValue$, suggestions$, highlighted$, onFocus$.startWith(false).distinctUntilChanged())
      .map(([{ onChange, ...props }, suggestions, { index: highlightedSuggestion }, hasFocus]) => ({
        ...props,
        hasFocus,
        setFocus,
        suggestions,
        highlightedSuggestion,
        onChange: (input, selected) => {
          onInputChanged({ input, selected });
          onChange && onChange(input, selected);
        },
        onSuggestionHighlighted: index => onHighlighted({ index, suggestion: suggestions[index] }),
      }))
      .map(R.omit(['filterBy', 'showValueInOptions']));
  }),
  pure,
)(ComboBoxComponent);

ComboBox.propTypes = {
  value: PropTypes.any,
  suggestions: PropTypes.array.isRequired,
  onChange: PropTypes.func,
  filterBy: PropTypes.func,
  getLabel: PropTypes.func,
  showValueInOptions: PropTypes.bool,
  autofocus: PropTypes.bool,
  className: PropTypes.string,
  renderSuggestion: PropTypes.func,
  matchCase: PropTypes.bool,
};

ComboBox.defaultProps = {
  autofocus: false,
  showValueInOptions: false,
  matchCase: false,
  getLabel: (obj) => {
    if (obj === undefined) return '';
    return obj.label === undefined ? obj.toString() : obj.label;
  },
};

export default ComboBox;
