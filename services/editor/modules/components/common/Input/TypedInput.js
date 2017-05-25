import React, { PropTypes } from 'react';
import { withContext, getContext } from 'recompose';
import changeCase from 'change-case';
import Input from './Input';
import ComboBox from '../ComboBox/ComboBox';

export const typesServiceContextType = {
  types: PropTypes.object.isRequired,
  safeConvertValue: PropTypes.func.isRequired,
};

export const withTypesService = ({ safeConvertValue, types }) => withContext(typesServiceContextType, () => ({ safeConvertValue, types }));

const getTypesService = getContext(typesServiceContextType);

const TypedInput = ({ safeConvertValue, types, valueType, value, onChange, ...props }) => {
  const typeDefinition = types[valueType];
  const allowedValues = typeDefinition && typeDefinition.allowedValues;
  const onChangeConvert = onChange ? newValue => onChange(safeConvertValue(newValue, valueType)) : undefined;
  if (allowedValues && allowedValues.length > 0) {
    return (<ComboBox
      {...props}
      options={allowedValues.map(x => ({ label: changeCase.pascalCase(x), value: x }))}
      onChange={x => onChangeConvert(x.value === undefined ? x : x.value)}
      selected={value === undefined ? [] : [{ label: changeCase.pascalCase(value), value }]}
      showValueInOptions={false}
    />);
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
