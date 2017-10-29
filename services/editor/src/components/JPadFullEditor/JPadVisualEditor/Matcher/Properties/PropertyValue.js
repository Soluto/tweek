import React from 'react';
import { setDisplayName, mapProps, compose } from 'recompose';
import * as R from 'ramda';
import { WithContext as ReactTags } from 'react-tag-input';
import TypedInput, { getTypesService } from '../../../../../components/common/Input/TypedInput';
import { inOp } from '../../../../../services/operators-provider';
import './styles.css';

const TagsPropertyValue = compose(
  setDisplayName('TagsPropertyValue'),
  getTypesService,
  mapProps(({ onChange, value, safeConvertValue, valueType }) => ({
    tags: value.map(x => ({ id: x, text: x.toString() })),
    suggestions: (valueType.allowedValues && valueType.allowedValues.map(x => x.toString())) || [],
    handleAddition: newValue => onChange([...value, safeConvertValue(newValue, valueType)]),
    handleDelete: valueIndex => onChange(R.remove(valueIndex, 1, value)),
  })),
)(props => (
  <div className="property-value-tags-wrapper">
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

const PropertyValue = ({ selectedOperator, ...props }) => (
  <div className="property-value-wrapper">
    {selectedOperator === inOp.operatorValue ? (
      <TagsPropertyValue data-comp="property-value" {...props} />
    ) : (
      <TypedInput data-comp="property-value" {...props} />
    )}
  </div>
);

PropertyValue.defaultProps = {
  placeholder: 'Value',
  value: '',
};

export default PropertyValue;
