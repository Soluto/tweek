import { useState } from 'react';
import * as ContextService from '../../../../../services/context-service';
import { getPropertySupportedOperators } from '../../../../../services/operators-provider';
import { AnyMutator } from '../../../../../utils/mutator';
import { Rule } from '../../../types';
import PropertyComboBox, { Suggestion } from './PropertyComboBox';

const ensureKeysIdentity = (property: string) =>
  property.replace(/^@@key:/, ContextService.KEYS_IDENTITY);

export type PropertyNameProps = {
  property: string;
  suggestedValues: Suggestion[];
  mutate: AnyMutator<Rule, ['Matcher', string]>;
  autofocus?: boolean;
};

const PropertyName = ({ mutate, property, suggestedValues, autofocus }: PropertyNameProps) => {
  const [hasFocus, onFocus] = useState(false);
  property = ensureKeysIdentity(property);

  const selectProperty = ({ value, defaultValue = '' }: Suggestion) => {
    const propertyTypeDetails = ContextService.getPropertyTypeDetails(value);
    const supportedOperators = getPropertySupportedOperators(propertyTypeDetails);
    const newOperator = supportedOperators[0];

    const newValue = newOperator.getValue(defaultValue, propertyTypeDetails);
    mutate.apply((m) => m.updateKey(value).updateValue(newValue));
  };

  const onChange = (input: string, selected?: Suggestion) => {
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
      suggestedValues={suggestedValues}
      autofocus={autofocus}
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
