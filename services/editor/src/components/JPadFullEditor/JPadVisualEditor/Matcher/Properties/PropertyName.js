import React from 'react';
import PropertyComboBox from './PropertyComboBox';
import * as ContextService from '../../../../../services/context-service';
import { getPropertySupportedOperators } from '../../../../../services/operators-provider';

const propertyTypeDetailsToComparer = propertyTypeDetails =>
  propertyTypeDetails.comparer ? { $compare: propertyTypeDetails.comparer } : {};

export default ({ mutate, ...props }) => {
  const selectProperty = (newProperty) => {
    const propertyTypeDetails = ContextService.getPropertyTypeDetails(newProperty.value);
    const supportedOperators = getPropertySupportedOperators(propertyTypeDetails);
    const newOperator = supportedOperators[0];

    const newValue = newOperator.getValue(
      newProperty.defaultValue || '',
      propertyTypeDetailsToComparer(propertyTypeDetails),
    );
    mutate.apply(m => m.updateKey(newProperty.value).updateValue(newValue));
  };

  return <PropertyComboBox {...props} onPropertyChange={selectProperty} />;
};
