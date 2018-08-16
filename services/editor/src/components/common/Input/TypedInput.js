import React from 'react';
import PropTypes from 'prop-types';
import { compose, mapProps, withContext, getContext } from 'recompose';
import changeCase from 'change-case';
import ComboBox from '../ComboBox/ComboBox';
import Input from './Input';
import { showCustomAlert } from '../../../store/ducks/alerts';
import { connect } from 'react-redux';
import { withJsonEditor } from './EditJSON';
import TagsPropertyValue from './TagsPropertyValue';
import './TypedInput.css';

export const typesServiceContextType = {
  types: PropTypes.object.isRequired,
  safeConvertValue: PropTypes.func.isRequired,
  isAllowedValue: PropTypes.func.isRequired,
};

export const withTypesService = ({ safeConvertValue, types, isAllowedValue }) =>
  withContext(typesServiceContextType, () => ({ safeConvertValue, types, isAllowedValue }));

export const getTypesService = getContext(typesServiceContextType);

const valueToItem = value =>
  value === undefined || value === '' ? undefined : { label: changeCase.pascalCase(value), value };

const InputComponent = ({
  value,
  valueType,
  valueTypeName,
  allowedValues,
  onChange,
  editJson,
  types,
  ...props
}) => {
  if (valueType.name === types.array.name) {
    return (
      <TagsPropertyValue
        data-comp="property-value"
        value={value || valueType.emptyValue}
        valueType={valueType}
        onChange={onChange}
        {...props}
      />
    );
  }
  if (allowedValues && allowedValues.length > 0) {
    return (
      <ComboBox
        {...props}
        value={value === undefined ? undefined : changeCase.pascalCase(value)}
        suggestions={allowedValues.map(valueToItem)}
        onChange={(input, selected) =>
          selected && onChange(selected.value === undefined ? selected : selected.value)
        }
      />
    );
  }
  if (valueTypeName === 'object') {
    return (
      <div>
        <Input
          readOnly
          {...props}
          onChange={onChange}
          value={value ? JSON.stringify(value) : value}
        />
        <button
          className="text-input object-type-expander"
          data-comp="object-editor"
          onClick={() => editJson(value)}
        />
      </div>
    );
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
      const onChangeConvert = newValue =>
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
  withJsonEditor,
)(InputWithIcon);

TypedInput.propTypes = {
  placeholder: PropTypes.string,
  valueType: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({
      name: PropTypes.string,
      base: PropTypes.string,
      ofType: PropTypes.string,
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
