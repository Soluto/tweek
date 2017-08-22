import React from 'react';
import { mapProps, withState, compose } from 'recompose';
import * as ContextService from '../../../../../services/context-service';
import { getPropertySupportedOperators } from '../../../../../services/operators-provider';
import PropertyComboBox from './PropertyComboBox';

const propertyTypeDetailsToComparer = ({ comparer: $compare }) => ($compare ? { $compare } : {});

const PropertyName = compose(
  withState('warning', 'setWarning', false),
  mapProps(({ mutate, setWarning, ...props }) => {
    const selectProperty = ({ value, defaultValue = '' }) => {
      const propertyTypeDetails = ContextService.getPropertyTypeDetails(value);
      const supportedOperators = getPropertySupportedOperators(propertyTypeDetails);
      const newOperator = supportedOperators[0];

      const newValue = newOperator.getValue(
        defaultValue,
        propertyTypeDetailsToComparer(propertyTypeDetails),
      );
      mutate.apply(m => m.updateKey(value).updateValue(newValue));
    };

    const onChange = (input, selected) => {
      if (selected) {
        selectProperty(selected);
        return;
      }

      input = input.replace('@@key:', ContextService.KEYS_IDENTITY);
      mutate.apply(m => m.updateKey(input).updateValue(''));
      setWarning(!input.startsWith(ContextService.FIXED_PREFIX) && input.includes('.'));
    };

    return {
      'data-comp': 'property-name',
      ...props,
      onChange,
    };
  }),
)(PropertyComboBox);

PropertyName.displayName = 'PropertyName';

export default PropertyName;
