import React from 'react';
import PropTypes from 'prop-types';
import { compose, mapProps, withContext, getContext } from 'recompose';
import changeCase from 'change-case';
import ComboBox from '../ComboBox/ComboBox';
import Input from './Input';
import './TypedInput.css';

export const typesServiceContextType = {
  types: PropTypes.object.isRequired,
  safeConvertValue: PropTypes.func.isRequired,
};

export const withTypesService = ({ safeConvertValue, types }) =>
  withContext(typesServiceContextType, () => ({ safeConvertValue, types }));

const getTypesService = getContext(typesServiceContextType);

const valueToItem = value =>
  value === undefined || value === '' ? undefined : { label: changeCase.pascalCase(value), value };


const InputComponent = ({ value, allowedValues, onChange, ...props }) => {
  if (allowedValues && allowedValues.length > 0) {
    return (
      <ComboBox
        {...props}
        value={value === undefined ? undefined : changeCase.pascalCase(value)}
        suggestions={allowedValues.map(valueToItem)}
        onChange={(input, selected) =>
          selected && onChange(selected.value === undefined ? selected : selected.value)}
      />
    );
  }
  return <Input {...props} onChange={onChange} value={value} />;
};

const InputWithIcon = ({ valueType, ...props }) =>
  <div className="typed-input-with-icon">
    <i data-value-type={valueType} />
    <InputComponent {...props} />
  </div>;

const TypedInput = compose(
  getTypesService,
  mapProps(({ safeConvertValue, types, valueType, onChange, customType, ...props }) => {
    const typeDefinition = valueType === 'custom' ? customType : types[valueType];
    const allowedValues = typeDefinition && typeDefinition.allowedValues;
    const onChangeConvert = newValue => onChange && onChange(safeConvertValue(newValue, valueType));

    return { allowedValues, onChange: onChangeConvert, valueType, ...props };
  }),
)(InputWithIcon);

TypedInput.propTypes = {
  placeholder: PropTypes.string,
  valueType: PropTypes.object.isRequired,
  onChange: PropTypes.func,
  value: PropTypes.any,
  customType: PropTypes.object,
};

TypedInput.defaultProps = {
  placeholder: 'Enter Value Here',
};

TypedInput.displayName = 'TypedInput';

export default TypedInput;
