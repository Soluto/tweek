import React, { PropTypes } from 'react';
import changeCase from 'change-case';
import Input from '../Input/Input';
import ComboBox from '../ComboBox/ComboBox';

const TypedInput = ({ allowedValues, value, onChange, ...props }) => {
  if (allowedValues && allowedValues.length > 0) {
    return (<ComboBox
      {...props}
      options={allowedValues.map(x => ({ label: changeCase.pascalCase(x), value: x }))}
      onChange={x => onChange(x.value === undefined ? x : x.value)}
      selected={value === undefined ? [] : [{ label: changeCase.pascalCase(value), value }]}
      showValueInOptions={false}
    />);
  }

  return <Input {...props} {...{ onChange, value }} />;
};

TypedInput.propTypes = {
  placeholder: PropTypes.string,
  allowedValues: PropTypes.array,
  onChange: PropTypes.func.isRequired,
  value: PropTypes.any,
};

TypedInput.defaultProps = {
  placeholder: 'Enter Value Here',
  allowedValues: undefined,
  value: undefined,
};

export default TypedInput;
