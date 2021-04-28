import * as changeCase from 'change-case';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { compose, mapProps } from 'recompose';
import { getTypesService } from '../../../contexts/TypesService';
import { showCustomAlert } from '../../../store/ducks';
import ComboBox from '../ComboBox/ComboBox';
import DateInput from './DateInput';
import { withJsonEditor } from './EditJSON';
import Input from './Input';
import ListTypedValue from './ListTypedValue';
import './TypedInput.css';

const valueToItem = (value) =>
  value === undefined || value === ''
    ? undefined
    : { label: changeCase.pascalCase(value.toString()), value };

const CodeEditor = withJsonEditor(
  ({ editJson, onChange, value, valueType, 'data-comp': dataComp, ...props }) => (
    <div data-comp={dataComp}>
      <Input
        onDoubleClick={() => editJson(value, valueType)}
        readOnly
        {...props}
        onChange={onChange}
        value={value ? JSON.stringify(value) : value}
      />
      <button
        className="text-input object-type-expander"
        data-comp="object-editor"
        onClick={() => editJson(value, valueType)}
      />
    </div>
  ),
);

const InputComponent = ({
  value,
  valueType,
  valueTypeName,
  allowedValues,
  onChange,
  types,
  ...props
}) => {
  if (
    valueTypeName === types.object.name ||
    (valueTypeName === types.array.name && !valueType.ofType)
  ) {
    return (
      <CodeEditor
        valueType={valueType}
        onChange={(x) => onChange(JSON.parse(x))}
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
        valueType={valueType.ofType || { base: 'string' }}
        onChange={onChange}
        {...props}
      />
    );
  }
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

const InputWithIcon = ({ hideIcon, valueTypeName, ...props }) => {
  const renderedInput = (
    <InputComponent
      data-comp="typed-input"
      data-value-type={valueTypeName}
      valueTypeName={valueTypeName}
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

const TypedInput = compose(
  connect(null, {
    showCustomAlert,
  }),
  getTypesService,
  mapProps(
    ({
      safeConvertValue,
      types,
      isAllowedValue,
      valueType,
      onChange,
      showCustomAlert,
      ...props
    }) => {
      valueType = (typeof valueType === 'string' ? types[valueType] : valueType) || {
        name: 'unknown',
      };
      const onChangeConvert = (newValue) =>
        onChange && onChange(safeConvertValue(newValue, valueType));
      const valueTypeName = valueType.name || valueType.base;
      return {
        allowedValues: valueType.allowedValues,
        onChange: onChangeConvert,
        valueType,
        valueTypeName,
        types,
        ...props,
      };
    },
  ),
)(InputWithIcon);

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
