import * as changeCase from 'change-case';
import PropTypes from 'prop-types';
import React from 'react';
import { useTypesService } from '../../../contexts/TypesService';
import { ValueType } from '../../../services/types-service';
import ComboBox from '../ComboBox/ComboBox';
import CodeEditor from './CodeEditor';
import DateInput from './DateInput';
import Input from './Input';
import ListTypedValue from './ListTypedValue';
import './TypedInput.css';

const valueToItem = (value: any) =>
  value === undefined || value === ''
    ? undefined
    : { label: changeCase.pascalCase(value.toString()), value };

type InputComponentProps = {
  value: any;
  onChange: (value: any) => void;
  valueType: ValueType;
  valueTypeName: string;
  types: Record<string, ValueType>;
};

const InputComponent = ({
  value,
  valueType,
  valueTypeName,
  onChange,
  types,
  ...props
}: InputComponentProps) => {
  if (
    valueTypeName === types.object.name ||
    (valueTypeName === types.array.name && !valueType.ofType)
  ) {
    return (
      <CodeEditor
        valueType={valueType}
        onChange={(x: string) => onChange(JSON.parse(x))}
        value={value}
        {...props}
      />
    );
  }

  if (valueTypeName === types.array.name) {
    return (
      <ListTypedValue
        data-comp="property-value"
        value={value || valueType.emptyValue}
        valueType={valueType.ofType || types.string}
        onChange={onChange}
        {...props}
      />
    );
  }

  const allowedValues = valueType.allowedValues;
  if (allowedValues && allowedValues.length > 0) {
    return (
      <ComboBox
        {...props}
        value={value === undefined ? undefined : changeCase.pascalCase(value.toString())}
        suggestions={allowedValues.map(valueToItem)}
        onChange={(input, selected) =>
          selected && onChange(selected.value === undefined ? selected : selected.value)
        }
      />
    );
  }

  if (valueTypeName === types.date.name) {
    return <DateInput onChange={onChange} value={value} {...props} />;
  }

  return <Input {...props} onChange={onChange} value={value} />;
};

export type TypedInputProps = {
  value: any;
  onChange?: (value: any) => void;
  hideIcon?: boolean;
  valueType: string | ValueType;
  className?: string;
};

const TypedInput = ({
  hideIcon,
  valueType: originalValueType,
  onChange,
  ...props
}: TypedInputProps) => {
  const { safeConvertValue, types } = useTypesService();

  const valueType: ValueType = (typeof originalValueType === 'string'
    ? types[originalValueType]
    : originalValueType) || { name: 'unknown' };

  const valueTypeName = valueType.name || valueType.base;

  const renderedInput = (
    <InputComponent
      data-comp="typed-input"
      data-value-type={valueTypeName}
      valueTypeName={valueTypeName!}
      onChange={(newValue) => onChange && onChange(safeConvertValue(newValue, valueType))}
      valueType={valueType}
      types={types}
      {...props}
    />
  );

  return hideIcon ? (
    renderedInput
  ) : (
    <div className="typed-input-with-icon">
      <i data-value-type={valueTypeName} />
      {renderedInput}
    </div>
  );
};

TypedInput.propTypes = {
  placeholder: PropTypes.string,
  valueType: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({
      name: PropTypes.string,
      base: PropTypes.string,
      allowedValues: PropTypes.array,
    }),
  ]).isRequired,
  onChange: PropTypes.func,
  value: PropTypes.any,
  hideIcon: PropTypes.bool,
};

TypedInput.defaultProps = {
  placeholder: 'Enter Value Here',
  hideIcon: false,
};

TypedInput.displayName = 'TypedInput';

export default TypedInput;
