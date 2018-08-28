import React from 'react';
import { compose, mapProps } from 'recompose';
import withPropertyTypeDetails from '../../../../../hoc/with-property-type-details';
import {
  equal,
  allOperators,
  getPropertySupportedOperators,
} from '../../../../../services/operators-provider';
import Operator from './Operator';
import PropertyValue from './PropertyValue';

const PropertyPredicate = ({
  mutate,
  supportedOperators,
  selectedOperator,
  propertyTypeDetails,
  predicateValue,
}) => (
  <div style={{ display: 'flex' }}>
    <Operator
      supportedOperators={supportedOperators}
      selectedOperator={selectedOperator}
      onUpdate={newOperator =>
        mutate.updateValue(newOperator.getValue(predicateValue, propertyTypeDetails))
      }
    />
    <PropertyValue
      valueType={propertyTypeDetails}
      value={predicateValue}
      selectedOperator={selectedOperator.operatorValue}
      onChange={newPropertyValue =>
        mutate.updateValue(selectedOperator.getValue(newPropertyValue, propertyTypeDetails))
      }
    />
  </div>
);

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
      selectedOperator = supportedOperators.find(x =>
        Object.keys(predicate).find(predicateProperty => predicateProperty === x.operatorValue),
      );
      predicateValue = predicate[selectedOperator.operatorValue];
    }
    return { supportedOperators, selectedOperator, propertyTypeDetails, predicateValue, ...props };
  }),
)(PropertyPredicate);
