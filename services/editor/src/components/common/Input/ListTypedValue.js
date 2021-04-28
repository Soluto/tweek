import classes from 'classnames';
import * as R from 'ramda';
import React from 'react';
import { WithContext as ReactTags } from 'react-tag-input';
import { compose, mapProps, withHandlers, withProps } from 'recompose';
import { getTypesService } from '../../../contexts/TypesService';

const convertToArray = (value) => (value && (Array.isArray(value) ? value : [value])) || [];

const toTags = (arr) => arr.map((x) => x.toString()).map((x) => ({ id: x, text: x }));

const enhance = compose(
  getTypesService,
  withProps(({ value }) => ({ value: convertToArray(value) })),
  withHandlers({
    handleAddition: ({ onChange, value, safeConvertValue, isAllowedValue, valueType }) => (
      newValue,
    ) => {
      const convertedVal = safeConvertValue(newValue.text, valueType);
      if (
        convertedVal !== undefined &&
        !value.includes(convertedVal) &&
        isAllowedValue(valueType, convertedVal)
      ) {
        return onChange && onChange([...value, convertedVal]);
      }
    },
    handleDelete: ({ onChange, value }) => (valueIndex) =>
      onChange && onChange(R.remove(valueIndex, 1, value)),
    handleFilterSuggestions: ({ value, safeConvertValue, valueType }) => (textInput, suggestions) =>
      suggestions.filter(
        ({ text }) =>
          !value.includes(safeConvertValue(text, valueType)) && text.includes(textInput),
      ),
  }),
  mapProps(
    ({
      value,
      valueType,
      handleAddition,
      handleDelete,
      handleFilterSuggestions,
      'data-comp': dataComp,
      'data-value-type': dataValueType,
    }) => ({
      value,
      tags: toTags(value),
      suggestions: toTags(valueType.allowedValues || []),
      handleAddition,
      handleDelete,
      handleFilterSuggestions,
      dataComp,
      dataValueType,
    }),
  ),
);

const ListTypedValue = (props) => (
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
      allowDragDrop={false}
      allowDeleteFromEmptyInput
      autocomplete
      allowUnique={false}
      classNames={{
        tags: 'tags-container',
        tagInput: 'tag-input',
        tag: 'tag',
        remove: 'tag-delete-button',
        suggestions: 'tags-suggestion',
      }}
    />
  </div>
);

export default enhance(ListTypedValue);
