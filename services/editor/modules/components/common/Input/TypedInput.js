import React, { PropTypes } from 'react';
import changeCase from 'change-case';
import { safeConvertValue, types } from '../../../services/types-service';
import Input from './Input';
import ComboBox from '../ComboBox/ComboBox';

const TypedInput = ({ valueType, value, onChange, ...props }) => {
  const typeDefinition = types[valueType];
  const allowedValues = typeDefinition && typeDefinition.allowedValues;
  const onChangeConvert = newValue => onChange(safeConvertValue(newValue, valueType));
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
  onChange: PropTypes.func.isRequired,
  value: PropTypes.any,
};

TypedInput.defaultProps = {
  placeholder: 'Enter Value Here',
  value: undefined,
};

export default TypedInput;
