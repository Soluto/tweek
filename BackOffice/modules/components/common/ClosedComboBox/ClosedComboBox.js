import { withState } from 'recompose';
import React from 'react';
import Autosuggest from 'react-autosuggest';
import style from './ClosedComboBox.css';

let defaultSuggestRenderer = (s) => (<span>{s.label}</span>);

export default withState('tempValue', 'updateTempValue', null)(({
  tempValue,
  updateTempValue,
  inputProps: { value, onChange, ...otherInputProps },
  suggestions,
  onSuggestionSelected,
  renderSuggestion,
  placeholder,
  theme,
  ...autosuggestProps }) => {
  renderSuggestion = renderSuggestion || defaultSuggestRenderer;
  let getSuggestionValue = x => (x && x.label !== null) ? x.label : x;
  let getSuggestionByValue = val => suggestions.find(s => getSuggestionValue(s) === val);
  tempValue = tempValue === null ? value : tempValue;
  onSuggestionSelected = onSuggestionSelected || ((e, { suggestion, suggestionValue, sectionIndex, method }) => {
    onChange(suggestion);
  });

  const autosuggestTheme = theme ? theme : style;

  return (
    <div className={style['autosuggest-wrapper']}>
    <Autosuggest
      className="OpDropdown"
      placeholder={placeholder}
      inputProps={{ ...otherInputProps, onChange:
        (e, { newValue }) => updateTempValue(newValue),
        onBlur: (e) => {
          let newValue = e.target.value;
          let newSuggestion = getSuggestionByValue(newValue) || getSuggestionByValue(value);
          if (!newSuggestion) return;
          updateTempValue(getSuggestionValue(newSuggestion));
          if (newValue !== value) onChange(newSuggestion);
        }, value: tempValue,
      }}
      shouldRenderSuggestions={_ => true}
      onSuggestionSelected={onSuggestionSelected}
      {...{
        getSuggestionValue,
        suggestions,
        renderSuggestion,
        ...autosuggestProps,
      }}
      theme={autosuggestTheme}
    />
    </div>
  );
});
