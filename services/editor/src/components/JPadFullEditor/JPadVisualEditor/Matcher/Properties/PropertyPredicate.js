import React from 'react';
import { compose, mapProps } from 'recompose';
import withPropertyTypeDetails from '../../../../../hoc/with-property-type-details';
import {
  equal,
  inOp,
  allOperators,
  getPropertySupportedOperators,
} from '../../../../../services/operators-provider';
import Operator from './Operator';
import PropertyValue from './PropertyValue';

const translateValue = (oldOperator, newOperator, value) => {
  if (oldOperator.operatorValue === inOp.operatorValue) return value.length > 0 ? value[0] : '';
  if (newOperator.operatorValue === inOp.operatorValue) return value ? [value] : [];
  return value;
};

const propertyTypeDetailsToComparer = propertyTypeDetails =>
  propertyTypeDetails.comparer ? { $compare: propertyTypeDetails.comparer } : {};

const PropertyPredicate = ({
  mutate,
  supportedOperators,
  selectedOperator,
  propertyTypeDetails,
  predicateValue,
}) =>
  <div style={{ display: 'flex' }}>
    <Operator
      supportedOperators={supportedOperators}
      selectedOperator={selectedOperator}
      onUpdate={newOperator =>
        mutate.updateValue(
          newOperator.getValue(
            translateValue(selectedOperator, newOperator, predicateValue),
            propertyTypeDetailsToComparer(propertyTypeDetails),
          ),
        )}
    />
    <PropertyValue
      valueType={propertyTypeDetails}
      value={predicateValue}
      selectedOperator={selectedOperator.operatorValue}
      onChange={newPropertyValue =>
        mutate.updateValue(
          selectedOperator.getValue(
            newPropertyValue,
            propertyTypeDetailsToComparer(propertyTypeDetails),
          ),
        )}
    />
  </div>;

export default compose(
  withPropertyTypeDetails(),
  mapProps(({ property, predicate, propertyTypeDetails, ...props }) => {
    const supportedOperators = getPropertySupportedOperators(propertyTypeDetails);
    let predicateValue;
    let selectedOperator;
    if (typeof predicate !== 'object') {
      selectedOperator = supportedOperators.indexOf(equal) >= 0 ? equal : supportedOperators[0];
      predicateValue = predicate;
    } else {
      selectedOperator = allOperators.find(x =>
        Object.keys(predicate).find(predicateProperty => predicateProperty === x.operatorValue),
      );
      predicateValue = predicate[selectedOperator.operatorValue];
    }
    return { supportedOperators, selectedOperator, propertyTypeDetails, predicateValue, ...props };
  }),
)(PropertyPredicate);
