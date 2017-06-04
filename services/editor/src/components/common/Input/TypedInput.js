import React from 'react';
import PropTypes from 'prop-types';
import { withContext, getContext } from 'recompose';
import changeCase from 'change-case';
import ComboBox from '../ComboBox/ComboBox';
import Input from './Input';

export const typesServiceContextType = {
  types: PropTypes.object.isRequired,
  safeConvertValue: PropTypes.func.isRequired,
};

export const withTypesService = ({ safeConvertValue, types }) =>
  withContext(typesServiceContextType, () => ({ safeConvertValue, types }));

const getTypesService = getContext(typesServiceContextType);

const valueToItem = value =>
  value === undefined || value === '' ? undefined : { label: changeCase.pascalCase(value), value };

const TypedInput = ({ safeConvertValue, types, valueType, value, onChange, ...props }) => {
  const typeDefinition = types[valueType];
  const allowedValues = typeDefinition && typeDefinition.allowedValues;
  const onChangeConvert = newValue => onChange && onChange(safeConvertValue(newValue, valueType));
  if (allowedValues && allowedValues.length > 0) {
    return (
      <ComboBox
        {...props}
        value={value === undefined ? undefined : changeCase.pascalCase(value)}
        suggestions={allowedValues.map(valueToItem)}
        onChange={(input, selected) =>
          selected && onChangeConvert(selected.value === undefined ? selected : selected.value)}
      />
    );
  }
  return <Input {...props} onChange={onChangeConvert} value={value} />;
};

TypedInput.propTypes = {
  placeholder: PropTypes.string,
  valueType: PropTypes.string.isRequired,
  onChange: PropTypes.func,
  value: PropTypes.any,
};

TypedInput.defaultProps = {
  placeholder: 'Enter Value Here',
  value: undefined,
  onChange: undefined,
};

export default getTypesService(TypedInput);
