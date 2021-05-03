import React from 'react';
import { usePropertyTypeDetails } from '../../../../../hoc/with-property-type-details';
import { equal, getPropertySupportedOperators } from '../../../../../services/operators-provider';
import Operator from './Operator';
import PropertyValue from './PropertyValue';

const PropertyPredicate = ({ property, predicate, mutate }) => {
  const propertyTypeDetails = usePropertyTypeDetails(property);
  const supportedOperators = getPropertySupportedOperators(propertyTypeDetails);

  let predicateValue;
  let selectedOperator;
  if (typeof predicate !== 'object') {
    selectedOperator = supportedOperators.includes(equal) ? equal : supportedOperators[0];
    predicateValue = predicate;
  } else {
    selectedOperator = supportedOperators.find((x) =>
      Object.keys(predicate).find((predicateProperty) => predicateProperty === x.operatorValue),
    );
    selectedOperator = selectedOperator || { operatorValue: Object.keys(predicate)[0] };
    predicateValue = predicate[selectedOperator.operatorValue];
  }

  return (
    <div style={{ display: 'flex' }}>
      <Operator
        supportedOperators={supportedOperators}
        selectedOperator={selectedOperator}
        onUpdate={(newOperator) =>
          mutate.updateValue(newOperator.getValue(predicateValue, propertyTypeDetails))
        }
      />
      <PropertyValue
        valueType={propertyTypeDetails}
        value={predicateValue}
        selectedOperator={selectedOperator.operatorValue}
        onChange={(newPropertyValue) =>
          mutate.updateValue(selectedOperator.getValue(newPropertyValue, propertyTypeDetails))
        }
      />
    </div>
  );
};

export default PropertyPredicate;
