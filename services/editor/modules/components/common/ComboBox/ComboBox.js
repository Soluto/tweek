import React from 'react';
import { Typeahead } from 'react-bootstrap-typeahead';
import { compose, withState, mapProps, mapPropsStream } from 'recompose';
import style from './ComboBox.css';
import wrapComponentWithClass from '../../../hoc/wrap-component-with-class';

const noop = () => {};
const toLowerCase = a => a && a.toLowerCase && a.toLowerCase();
const compareLowerCase = (a, b) => toLowerCase(a) === toLowerCase(b);

const comp = compose(
  withState('currentInputValue', 'setCurrentInputValue', ''),
  mapProps(({ showValueInOptions, ...props }) => {
    const { options, currentInputValue } = props;
    if (currentInputValue && showValueInOptions && !options.some(x => x.label === currentInputValue)) {
      return {
        ...props,
        options: [({ label: currentInputValue, value: currentInputValue }), ...options],
      };
    }
    return props;
  }),
  mapPropsStream(props$ => props$.scan((prev, next) =>
    (prev.selected && prev.selected.length > 0 && next.selected && next.selected.length === 0) ?
    {
      ...next,
      currentInputValue: '',
    } : next
  )
  )
)(({ ...props,
  options,
  selected = [],
  autofocus,
  setCurrentInputValue,
  currentInputValue,
  onChange = noop,
  onInputChange = noop,
}) => {
  const wrapperThemeClass = props.wrapperThemeClass ?
    props.wrapperThemeClass : style['combo-box-default-wrapper-theme-class'];
  return (
    <div className={wrapperThemeClass}>
      <Typeahead
        {...{ ...props, options, selected }}
        onChange={selectedValues => {
          if (onChange === noop) return;
          if (selectedValues.length < 1) {
            if (props.clearButton) onChange();
            return;
          }
          setCurrentInputValue(selectedValues[0].label);
          onChange(selectedValues[0]);
        }}
        onInputChange={text => {
          setCurrentInputValue(text);
          onInputChange(text);
        }}
        onBlur={e => {
          const selectedItem = options.find((x) => compareLowerCase(x, currentInputValue) || compareLowerCase(x.label, currentInputValue));
          if (selectedItem) {
            onChange(selectedItem);
          }
        }}
        ref={e =>
        {
          e && autofocus && e.refs.instance.focus();
          if (currentInputValue === '' && selected.length === 0) {
            const value = e && e.refs.instance.refs.input && e.refs.instance.refs.input.props.value;
            if (value && value !== '') {
              e.refs.instance.clear();
            }
          }
        }}
      />
    </div>
  );
});

export default wrapComponentWithClass(comp);
