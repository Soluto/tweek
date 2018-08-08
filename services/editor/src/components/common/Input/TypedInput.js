import React from 'react';
import PropTypes from 'prop-types';
import { compose, mapProps, withContext, getContext } from 'recompose';
import changeCase from 'change-case';
import ComboBox from '../ComboBox/ComboBox';
import Input from './Input';
import { showCustomAlert, buttons } from '../../../store/ducks/alerts';
import './TypedInput.css';
import { connect } from 'react-redux';
import { withJsonEditor } from './EditJSON';
import * as R from 'ramda';
import { WithContext as ReactTags } from 'react-tag-input';

export const typesServiceContextType = {
  types: PropTypes.object.isRequired,
  safeConvertValue: PropTypes.func.isRequired,
};

export const withTypesService = ({ safeConvertValue, types }) =>
  withContext(typesServiceContextType, () => ({ safeConvertValue, types }));

export const getTypesService = getContext(typesServiceContextType);

const valueToItem = value =>
  value === undefined || value === '' ? undefined : { label: changeCase.pascalCase(value), value };

const InputComponent = ({
  value,
  valueType,
  valueTypeName,
  allowedValues,
  onChange,
  onChangeConvert,
  isArray,
  editJson,
  ...props
}) => {
  if (isArray) {
    return (
      <TagsPropertyValue
        data-comp="property-value"
        value={value || []}
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
          selected && onChangeConvert(selected.value === undefined ? selected : selected.value)
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
          onChange={onChangeConvert}
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
  return <Input {...props} onChange={onChangeConvert} value={value} />;
};

const InputWithIcon = ({ hideIcon, iconType, ...props }) => {
  const renderedInput = (
    <InputComponent data-comp="typed-input" data-value-type={iconType} {...props} />
  );
  return hideIcon ? (
    renderedInput
  ) : (
    <div className="typed-input-with-icon">
      <i data-value-type={iconType} />
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
    ({ safeConvertValue, types, valueType, onChange, showCustomAlert, isArray, ...props }) => {
      isArray = isArray || valueType.name === 'array';
      const iconType = (valueType && (valueType.name || (valueType.base && 'custom'))) || 'unknown';
      const allowedValues = valueType && valueType.allowedValues;
      const onChangeConvert = newValue =>
        onChange && onChange(safeConvertValue(newValue, valueType));

      const valueTypeName = valueType.name || 'custom';
      return {
        allowedValues,
        onChange,
        onChangeConvert,
        iconType,
        valueType,
        valueTypeName,
        isArray,
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

const TagsPropertyValue = compose(
  getTypesService,
  mapProps(({ onChange, value, safeConvertValue, valueType }) => {
    const containsValue = (array, val) => array.some(item => item.toString() === val.toString());
    value = (Array.isArray(value) ? value : [value]) || [];
    return {
      tags: value.map(x => ({ id: x, text: x.toString() })),
      suggestions: valueType.allowedValues || [],
      handleAddition: (newValue) => {
        const convertedVal = safeConvertValue(newValue, valueType);
        if (
          onChange &&
          !containsValue(value, convertedVal) &&
          (!valueType.allowedValues ||
            valueType.allowedValues.length == 0 ||
            containsValue(valueType.allowedValues, convertedVal))
        ) {
          return onChange([...value, convertedVal]);
        }
      },
      handleDelete: valueIndex => onChange && onChange(R.remove(valueIndex, 1, value)),
      handleFilterSuggestions: (textInput, suggestions) =>
        suggestions.filter(item => !containsValue(value, item) && item.includes(textInput)),
    };
  }),
)(props => (
  <div className="text-input property-value-tags-wrapper">
    <ReactTags
      {...props}
      placeholder="Add value"
      minQueryLength={1}
      allowDeleteFromEmptyInput
      autocomplete
      classNames={{
        tags: 'tags-container',
        tagInput: 'tag-input',
        tag: 'tag',
        remove: 'tag-delete-button',
        suggestions: 'tags-suggestion',
      }}
    />
  </div>
));

export default TypedInput;
