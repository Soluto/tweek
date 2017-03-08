import React from 'react';
import R from 'ramda';
import { Operator } from './Operator';
import PropertyValue from './PropertyValue';
import * as ContextService from "../../../../../../../../../services/context-service";
import { withState, compose, mapProps } from 'recompose';
import { equal, inOp, allOperators, getPropertySupportedOperators } from '../../../../../../../../../services/operators-provider';

const translateValue = (oldOperator, newOperator, value) => {
  if (oldOperator.operatorValue === inOp.operatorValue) return value.length > 0 ? value[0] : '';
  if (newOperator.operatorValue === inOp.operatorValue) return !!value ? [value] : [];
  return value;
};

const propertyTypeDetailsToComparer = propertyTypeDetails => !!propertyTypeDetails.comparer ? { ['$compare']: propertyTypeDetails.comparer } : {};

const PropertyPredicate = mapProps(({ property, predicate, ...props }) => {
  const propertyTypeDetails = ContextService.getPropertyTypeDetails(property);
  const supportedOperators = getPropertySupportedOperators(propertyTypeDetails);
  let predicateValue, selectedOperator;
  if (typeof (predicate) !== 'object') {
    selectedOperator = supportedOperators.indexOf(equal) >= 0 ? equal : supportedOperators[0];
    predicateValue = predicate;
  } else {
    selectedOperator = allOperators.find(x => Object.keys(predicate).find(predicateProperty => predicateProperty === x.operatorValue));
    predicateValue = predicate[selectedOperator.operatorValue];
  }
  return { supportedOperators, selectedOperator, propertyTypeDetails, predicateValue, ...props };
})(({ mutate, supportedOperators, selectedOperator, propertyTypeDetails, predicateValue }) => {
  return (<div style={{ display: 'flex' }}>
    <Operator
      supportedOperators={supportedOperators}
      selectedOperator={selectedOperator}
      onUpdate={newOperator =>
        mutate.updateValue(newOperator.getValue(
          translateValue(selectedOperator, newOperator, predicateValue),
          propertyTypeDetailsToComparer(propertyTypeDetails)))} />
    <PropertyValue
      propertyTypeDetails={propertyTypeDetails}
      value={predicateValue}
      selectedOperator={selectedOperator.operatorValue}
      onUpdate={newPropertyValue =>
        mutate.updateValue(selectedOperator.getValue(newPropertyValue, propertyTypeDetailsToComparer(propertyTypeDetails)))} />
  </div>)
});

export default PropertyPredicate;
