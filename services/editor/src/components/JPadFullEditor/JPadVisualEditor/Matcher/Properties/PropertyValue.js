import React from 'react';
import R from 'ramda';
import { WithContext as ReactTags } from 'react-tag-input';
import TypedInput from '../../../../../components/common/Input/TypedInput';
import { inOp } from '../../../../../services/operators-provider';
import './styles.css';

const TagsPropertyValue = ({ onUpdate, value, suggestions }) => {
  const indexedTags = value.map(x => ({ id: x, text: x }));

  const handleAddtion = newValue => onUpdate([...value, newValue]);
  const handleDelete = valueIndex => onUpdate(R.remove(valueIndex, 1, value));
  const indexedSuggestions = suggestions ? suggestions.map(x => x) : [];

  return (
    <div className={'property-value-tags-wrapper'}>
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

const PropertyValue = ({
  onUpdate,
  propertyTypeDetails,
  selectedOperator,
  ...props
}) => {
  if (selectedOperator === inOp.operatorValue) {
    return (
      <TagsPropertyValue
        {...props}
        onUpdate={onUpdate}
        suggestions={propertyTypeDetails.allowedValues || []}
      />
    );
  }

  return (
    <TypedInput {...props} valueType={propertyTypeDetails} onChange={onUpdate} />
  );
};

PropertyValue.defaultProps = {
  placeholder: 'Value',
  value: '',
};

export default props =>
  <div className="property-value-wrapper">
    <PropertyValue data-comp="property-value" {...props} />
  </div>;
