import React, { Component, PropTypes } from 'react';
import Rx from 'rxjs';
import R from 'ramda';
import { compose, pure, mapPropsStream, createEventHandler } from 'recompose';
import ClickOutside from './ClickOutside';
import InputWithHint from './InputWithHint';
import Suggestions from './Suggestions';
import './ComboBox.css';

const keyCode = {
  ENTER: 13,
  UP: 38,
  RIGHT: 39,
  DOWN: 40,
  TAB: 9,
};

class ComboBoxComponent extends Component {
  get hint() {
    const { value, hasFocus, highlightedSuggestion, suggestions, getLabel } = this.props;
    if (!hasFocus) return '';
    const lowerValue = value.toLowerCase();
    let suggestion;

    if (highlightedSuggestion === -1) {
      if (value === '') return '';
      suggestion = suggestions.map(getLabel).find(x => x.toLowerCase().startsWith(lowerValue));
    } else {
      suggestion = suggestions[highlightedSuggestion];
    }
    suggestion = suggestion && getLabel(suggestion);
    if (!suggestion || !suggestion.toLowerCase().startsWith(lowerValue)) return '';
    return value + suggestion.substring(value.length);
  }

  getSuggestion = (index) => {
    const { suggestions } = this.props;
    return suggestions[Math.max(0, index)];
  };

  onSuggestionSelected = (index) => {
    const { onChange, getLabel } = this.props;
    const selected = this.getSuggestion(index);
    onChange(getLabel(selected), selected);
  };

  onInputChange = (input) => {
    const { suggestions, getLabel, onChange } = this.props;
    const selected = suggestions.find(s => getLabel(s) === input);
    onChange(input, selected);
  };

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

      onChange,
      onKeyDown,
      ...props } = this.props;

    const hint = this.hint;

    return (
      <ClickOutside
        className="combo-box-container"
        onFocus={() => setFocus(true)}
        onClickOutside={() => setFocus(false)}
      >
        <InputWithHint
          {...props}
          value={value}
          onChange={(e) => this.onInputChange(e.target.value)}
          showHint={hasFocus && (hint.length > 0 || value.length > 0)}
          hint={hint}
          onKeyDown={this.handleKeyDown}
        />
        { hasFocus && suggestions.length > 0 ?
          <Suggestions
            {...{suggestions, getLabel, highlightedSuggestion, onSuggestionHighlighted}}
            onSuggestionSelected={this.onSuggestionSelected}
          /> : null}
      </ClickOutside>
    );
  }
}

const ComboBox = compose(
  mapPropsStream((props$) => {
    const { handler: onHighlighted, stream: onHighlighted$ } = createEventHandler();
    const { handler: setFocus, stream: onFocus$ } = createEventHandler();
    const { handler: onInputChanged, stream: onInputChanged$ } = createEventHandler();

    const highlighted$ = onHighlighted$.startWith({index: -1}).distinctUntilChanged();

    const value$ = Rx.Observable.merge(
      props$
        .map(({value, getLabel}) => ({ input: getLabel(value), selected: value}))
        .distinctUntilChanged(R.equals),
      onInputChanged$
        .distinctUntilChanged(R.equals),
    ).distinctUntilChanged(R.equals);


    const propsWithValue$ = Rx.Observable.combineLatest(props$, value$)
      .map(([props, { input: value }]) => ({ ...props, value })).share();

    const suggestions$ = propsWithValue$
      .distinctUntilChanged((x, y) => R.equals(...[x, y].map(R.pick(['suggestions', 'value', 'showValueInOptions']))))
      .map(({suggestions, filterBy, value, getLabel, showValueInOptions}) => {
        const filterFunc = filterBy || ((input, suggestion) => input === '' || getLabel(suggestion).toLowerCase().includes(input));

        const filteredSuggestions = suggestions.filter(s => filterFunc(value.toLowerCase(), s));
        if (!showValueInOptions && filteredSuggestions.length === 1 && getLabel(filteredSuggestions[0]) === value) return [];
        return filteredSuggestions;
      })
      .withLatestFrom(highlighted$, (suggestions, highlighted) => ({ suggestions, highlighted }))
      .do(({suggestions, highlighted}) => {
        if (highlighted.index === -1) return;
        const index = R.findIndex(R.equals(highlighted.suggestion))(suggestions);
        onHighlighted({...highlighted, index});
      })
      .map(R.prop('suggestions'));

    return Rx.Observable.combineLatest(propsWithValue$, suggestions$, highlighted$, onFocus$.startWith(false).distinctUntilChanged())
      .map(([{onChange, ...props}, suggestions, { index: highlightedSuggestion }, hasFocus]) => ({
        ...props,
        hasFocus,
        setFocus,
        suggestions,
        highlightedSuggestion,
        onChange: (input, selected) => {
          onInputChanged({input, selected});
          onChange && onChange(input, selected);
        },
        onSuggestionHighlighted: index => onHighlighted({index, suggestion: suggestions[index]}),
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
};

ComboBox.defaultProps = {
  autofocus: false,
  showValueInOptions: false,
  getLabel: obj => obj === undefined ? '' : (obj.label === undefined ? obj.toString() : obj.label),
};

export default ComboBox;
