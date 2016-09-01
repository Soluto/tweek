import Typeahead from 'react-bootstrap-typeahead';
import React from 'react';
import style from './ComboBox.css';
import { compose, withState, mapProps } from 'recompose';
import R from 'ramda';

export default compose(
  withState('currentInputValue', 'setCurrentInputValue', ''),
  mapProps(({ options, currentInputValue, showValueInOptions, ...props }) => ({
    options: currentInputValue && showValueInOptions ? [currentInputValue, ...options] : options,
    ...props,
  })
)
)(({ ...props, autofocus, setCurrentInputValue, emptyItem = { label: '', value: '' } }) => {
  const wrapperThemeClass = props.wrapperThemeClass ?
    props.wrapperThemeClass : style['combo-box-default-wrapper-theme-class'];

  return (
    <div className={wrapperThemeClass}>
      <Typeahead {...props}
        onChange={selectedValues => {
          if (!props.onChange || selectedValues.length < 1) return;
          setCurrentInputValue(selectedValues[0]);
          props.onChange(selectedValues[0]);
        } }
        onInputChange={text => {
          if (props.onInputChange) props.onInputChange(text);
          setCurrentInputValue(text);
          if (text === '' && props.onChange) props.onChange(emptyItem);
        } }
        ref={e => e && autofocus && e.refs.instance.focus() }
      />
    </div>
  );
});
