import React from 'react';
import changeCase from 'change-case';
import R from 'ramda';
import { WithContext as ReactTags } from 'react-tag-input';
import ComboBox from '../../../../../components/common/ComboBox/ComboBox';
import Input from '../../../../../components/common/Input/Input';
import { inOp } from '../../../../../services/operators-provider';
import './styles.css';

const TagsPropertyValue = ({ onUpdate, value, suggestions }) => {
  const indexedTags = value.map(x => ({ id: x, text: x }));

  const handleAddtion = newValue => onUpdate([...value, newValue]);
  const handleDelete = valueIndex => onUpdate(R.remove(valueIndex, 1, value));
  const indexedSuggestions = suggestions ? suggestions.map(x => x) : [];

  return (
    <div className={'tags-wrapper'}>
      <ReactTags
        tags={indexedTags}
        suggestions={indexedSuggestions}
        handleAddition={handleAddtion}
        handleDelete={handleDelete}
        placeholder="Add value"
        minQueryLength={1}
        allowDeleteFromEmptyInput
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

function PropertyValueComponent({
  onUpdate,
  propertyTypeDetails,
  value = '',
  selectedOperator,
  placeholder = 'Value',
}) {
  let allowedValues = propertyTypeDetails.allowedValues || [];

  if (selectedOperator === inOp.operatorValue) {
    return <TagsPropertyValue onUpdate={onUpdate} value={value} suggestions={allowedValues} />;
  }

  if (allowedValues.length > 0) {
    allowedValues = allowedValues.map(x => ({ label: changeCase.pascalCase(x), value: x }));
    const selected = allowedValues.find(x => x.value === value);
    return (
      <ComboBox
        suggestions={allowedValues}
        placeholder={placeholder}
        className={'property-value-combo-box'}
        onChange={(_, selectedValue) => selectedValue && onUpdate(selectedValue.value)}
        value={selected ? selected.label : value.toString()}
      />
    );
  }

  return <Input {...{ onChange: onUpdate, value, placeholder }} />;
}

export default props => (
  <div className={'property-value-wrapper'}>
    <PropertyValueComponent {...props} />
  </div>
);
