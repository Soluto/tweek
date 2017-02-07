import Typeahead from 'react-bootstrap-typeahead';
import React from 'react';
import style from './ComboBox.css';
import { compose, withState, mapProps } from 'recompose';
import R from 'ramda';
import wrapComponentWithClass from '../../../hoc/wrap-component-with-class';

const comp = compose(
  withState('currentInputValue', 'setCurrentInputValue', ''),
  mapProps(({ options, currentInputValue, showValueInOptions, ...props }) => ({
    options: currentInputValue && showValueInOptions && R.findIndex(x => x.label === currentInputValue)(options) < 0 ?
      [({ label: currentInputValue, value: currentInputValue }), ...options] : options,
    currentInputValue, ...props,
  })
  )
)(({ ...props, autofocus, currentInputValue, setCurrentInputValue, emptyItem = { label: '', value: '' } }) => {
  const wrapperThemeClass = props.wrapperThemeClass ?
    props.wrapperThemeClass : style['combo-box-default-wrapper-theme-class'];

  return (
    <div className={wrapperThemeClass}>
      <Typeahead {...props}
        onChange={selectedValues => {
          if (!props.onChange || selectedValues.length < 1) return;
          setCurrentInputValue(selectedValues[0].label);
          props.onChange(selectedValues[0]);
        }}
        onInputChange={text => {
          setCurrentInputValue(text);
          if (props.onInputChange) props.onInputChange(text);
        }}
        ref={e => e && autofocus && e.refs.instance.focus()}
      />
    </div>
  );
});

export default wrapComponentWithClass(comp);
