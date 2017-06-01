import React, { PropTypes } from 'react';
import { withContext, getContext, compose, mapProps } from 'recompose';
import changeCase from 'change-case';
import Input from './Input';
import ComboBox from '../ComboBox/ComboBox';

export const typesServiceContextType = {
  types: PropTypes.object.isRequired,
  safeConvertValue: PropTypes.func.isRequired,
};

export const withTypesService = ({ safeConvertValue, types }) => withContext(typesServiceContextType, () => ({ safeConvertValue, types }));

const getTypesService = getContext(typesServiceContextType);

const valueToItem = value => (value === undefined || value === '' ? undefined : ({ label: changeCase.pascalCase(value), value }));

const TypedInput = ({ types, valueType, value, onChange, ...props }) => {
  const allowedValues = valueType && valueType.allowedValues;
  if (allowedValues && allowedValues.length > 0) {
    return (<ComboBox
      {...props}
      value={valueToItem(value)}
      suggestions={allowedValues.map(valueToItem)}
      onChange={(input, selected) => onChange(selected && (selected.value === undefined ? selected : selected.value))}
    />);
  }
  return <Input {...props} onChange={onChange} value={value} />;
};

TypedInput.propTypes = {
  placeholder: PropTypes.string,
  valueType: PropTypes.object.isRequired,
  onChange: PropTypes.func,
  value: PropTypes.any,
};

TypedInput.defaultProps = {
  placeholder: 'Enter Value Here',
  value: undefined,
  onChange: undefined,
};

export default compose(getTypesService,
mapProps(({ safeConvertValue, types, onChange, valueType, ...props }) => ({
  valueType: types[valueType],
  onChange: newValue => onChange && onChange(safeConvertValue(newValue, valueType)),
  ...props,
})))(TypedInput);
