import React from 'react';
import {
  ComplexValue,
  equal,
  getPropertySupportedOperators,
  Operator as OperatorType,
} from '../../../../../services/operators-provider';
import Operator from './Operator';
import PropertyValue from './PropertyValue';
import { usePropertyTypeDetails } from './usePropertyTypeDetails';

const getSelectedOperator = (
  property: string,
  predicate: any,
  supportedOperators: OperatorType<string>[],
): [OperatorType<string>, any] => {
  if (predicate && typeof predicate === 'object') {
    const op = supportedOperators.find((x) =>
      Object.keys(predicate).some((predicateProperty) => predicateProperty === x.operatorValue),
    );

    if (!op) {
      throw new Error('Unsupported operator');
    }

    return [op, predicate[op.operatorValue]];
  }

  const op = supportedOperators.includes(equal) ? equal : supportedOperators[0];
  return [op, predicate];
};

export type PropertyPredicateProps = {
  property: string;
  predicate: ComplexValue<string> | unknown;
  onChange: (value: ComplexValue<string> | unknown) => void;
};

const PropertyPredicate = ({ property, predicate, onChange }: PropertyPredicateProps) => {
  const propertyTypeDetails = usePropertyTypeDetails(property);
  const supportedOperators = getPropertySupportedOperators(propertyTypeDetails);

  const [selectedOperator, predicateValue] = getSelectedOperator(
    property,
    predicate,
    supportedOperators,
  );

  return (
    <div style={{ display: 'flex' }}>
      <Operator
        supportedOperators={supportedOperators}
        selectedOperator={selectedOperator}
        onUpdate={(newOperator) =>
          onChange(newOperator.getValue(predicateValue, propertyTypeDetails))
        }
      />
      <PropertyValue
        valueType={propertyTypeDetails}
        value={predicateValue}
        selectedOperator={selectedOperator.operatorValue}
        onChange={(newPropertyValue) =>
          onChange(selectedOperator.getValue(newPropertyValue, propertyTypeDetails))
        }
      />
    </div>
  );
};

export default PropertyPredicate;
