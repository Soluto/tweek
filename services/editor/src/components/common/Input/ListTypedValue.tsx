import classes from 'classnames';
import * as R from 'ramda';
import React from 'react';
import { WithContext as ReactTags } from 'react-tag-input';
import { useTypesService, ValueType } from '../../../contexts/TypesService';

const convertToArray = (value: any): any[] =>
  (value && (Array.isArray(value) ? value : [value])) || [];

type Tag = {
  id: string;
  text: string;
};

const toTags = (arr: string[]): Tag[] =>
  arr.map((x) => x.toString()).map((x) => ({ id: x, text: x }));

export type ListTypedValueProps = {
  value: any;
  valueType: ValueType;
  onChange?: (value: any) => void;
  'data-comp'?: string;
  'data-value-type'?: string;
};

const ListTypedValue = ({
  value,
  valueType,
  onChange,
  'data-comp': dataComp,
  'data-value-type': dataValueType,
}: ListTypedValueProps) => {
  value = convertToArray(value);

  const { safeConvertValue, isAllowedValue } = useTypesService();

  const tags = toTags(value);
  const suggestions = toTags(valueType.allowedValues || []);

  const handleAddition = (newValue: Tag) => {
    const convertedVal = safeConvertValue(newValue.text, valueType);
    if (
      convertedVal !== undefined &&
      !value.includes(convertedVal) &&
      isAllowedValue(valueType, convertedVal)
    ) {
      return onChange && onChange([...value, convertedVal]);
    }
  };
  const handleDelete = (valueIndex: number) => onChange && onChange(R.remove(valueIndex, 1, value));

  const handleFilterSuggestions = (textInput: string, suggestions: Tag[]) =>
    suggestions.filter(
      ({ text }) => !value.includes(safeConvertValue(text, valueType)) && text.includes(textInput),
    );

  return (
    <div
      data-comp={dataComp}
      data-value-type={dataValueType}
      className={classes('text-input', 'property-value-tags-wrapper', {
        'has-tags': value && value.length > 0,
      })}
    >
      <ReactTags
        tags={tags}
        suggestions={suggestions}
        handleFilterSuggestions={handleFilterSuggestions}
        handleDelete={handleDelete}
        handleAddition={handleAddition}
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
};

export default ListTypedValue;
