import React from 'react';
import PropTypes from 'prop-types';
import { compose, mapProps, getContext } from 'recompose';
import { WithContext as ReactTags } from 'react-tag-input';
import * as R from 'ramda';
import classes from 'classnames';

export const typesServiceContextType = {
  types: PropTypes.object.isRequired,
  safeConvertValue: PropTypes.func.isRequired,
  isAllowedValue: PropTypes.func.isRequired,
};

export const getTypesService = getContext(typesServiceContextType);

const convertToArray = value => (value && (Array.isArray(value) ? value : [value])) || [];

const ListTypedValue = compose(
  getTypesService,
  mapProps(({ onChange, value, safeConvertValue, isAllowedValue, valueType, ...props }) => {
    value = convertToArray(value);
    return {
      tags: value.map(x => ({ id: x, text: x.toString() })),
      suggestions: (valueType.allowedValues || []).map(x => x.toString()),
      handleAddition: (newValue) => {
        const convertedVal = safeConvertValue(newValue, valueType);
        if (
          convertedVal !== undefined &&
          !value.includes(convertedVal) &&
          isAllowedValue(valueType, convertedVal)
        ) {
          return onChange && onChange([...value, convertedVal]);
        }
      },
      handleDelete: valueIndex => onChange && onChange(R.remove(valueIndex, 1, value)),
      handleFilterSuggestions: (textInput, suggestions) =>
        suggestions.filter(
          item => !value.includes(safeConvertValue(item, valueType)) && item.includes(textInput),
        ),
      value,
      dataComp: props['data-comp'],
      dataValueType: props['data-value-type'],
    };
  }),
)(props => (
  <div
    data-comp={props.dataComp}
    data-value-type={props.dataValueType}
    className={classes('text-input', 'property-value-tags-wrapper', {
      'has-tags': props.value && props.value.length > 0,
    })}
  >
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

export default ListTypedValue;
