import { useState } from 'react';
import * as ContextService from '../../../../../services/context-service';
import { getPropertySupportedOperators } from '../../../../../services/operators-provider';
import PropertyComboBox from './PropertyComboBox';

const ensureKeysIdentity = (property) => property.replace(/^@@key:/, ContextService.KEYS_IDENTITY);

const PropertyName = ({ mutate, property, ...props }) => {
  const [hasFocus, onFocus] = useState(false);
  property = ensureKeysIdentity(property);

  const selectProperty = ({ value, defaultValue = '' }) => {
    const propertyTypeDetails = ContextService.getPropertyTypeDetails(value);
    const supportedOperators = getPropertySupportedOperators(propertyTypeDetails);
    const newOperator = supportedOperators[0];

    const newValue = newOperator.getValue(defaultValue, propertyTypeDetails);
    mutate.apply((m) => m.updateKey(value).updateValue(newValue));
  };

  const onChange = (input, selected) => {
    if (selected) {
      selectProperty(selected);
      return;
    }

    input = ensureKeysIdentity(input);
    mutate.apply((m) => m.updateKey(input).updateValue(''));
  };

  return (
    <PropertyComboBox
      data-comp="property-name"
      {...props}
      onFocus={onFocus}
      property={property}
      onChange={onChange}
      warning={
        !hasFocus &&
        !property.startsWith(ContextService.KEYS_IDENTITY) &&
        !property.startsWith('system') &&
        (!property.includes('.') ||
          !ContextService.getIdentities().includes(property.split('.')[0]))
      }
    />
  );
};

export default PropertyName;
