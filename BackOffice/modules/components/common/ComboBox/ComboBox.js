import {Typeahead} from 'react-bootstrap-typeahead';
import React from 'react';
import style from './ComboBox.css';
import {compose, withState, mapProps, withPropsOnChange, mapPropsStream} from 'recompose';
import R from 'ramda';
import wrapComponentWithClass from '../../../hoc/wrap-component-with-class';

const comp = compose(
  withState('currentInputValue', 'setCurrentInputValue', ''),
  mapProps(({options, currentInputValue, showValueInOptions, ...props}) => ({
      options: currentInputValue && showValueInOptions && R.findIndex(x => x.label === currentInputValue)(options) < 0 ?
        [({label: currentInputValue, value: currentInputValue}), ...options] : options,
      currentInputValue, ...props,
    })
  ),
  mapPropsStream(props$=>{
      return props$.scan((prev, next)=>{
          if (prev.selected && prev.selected.length > 0 && next.selected && next.selected.length === 0){
             return {
                ...next,
                currentInputValue : ""
             }
          }
          else {
            return next
          }
      });
  })
)(({...props, options, autofocus, setCurrentInputValue, currentInputValue}) => {
  const wrapperThemeClass = props.wrapperThemeClass ?
    props.wrapperThemeClass : style['combo-box-default-wrapper-theme-class'];

  return (
    <div className={wrapperThemeClass}>
      <Typeahead
        {...{...props, options}}
        onChange={selectedValues => {
          if (!props.onChange) return;
          if (selectedValues.length < 1) {
            if (props.clearButton) props.onChange();
            return;
          }
          setCurrentInputValue(selectedValues[0].label);
          props.onChange(selectedValues[0]);
        }}
        onInputChange={text => {
          setCurrentInputValue(text);
          let selectedItem = options.find((x)=> x === text || x.label === text);
          console.log("selected", selectedItem);
          if (selectedItem){
             props.onChange(selectedItem);
          }
          if (props.onInputChange) props.onInputChange(text);
        }}
        ref={e => 
        {
            e && autofocus && e.refs.instance.focus();
            e && console.log("ref", currentInputValue);
            if (currentInputValue ===""){
              const value = e && e.refs.instance.refs.input && e.refs.instance.refs.input.props.value;
              if (value && value !== "") {
                 e.refs.instance.clear();
              }
            }
        }}
      />
    </div>
  );
});

export default wrapComponentWithClass(comp);
