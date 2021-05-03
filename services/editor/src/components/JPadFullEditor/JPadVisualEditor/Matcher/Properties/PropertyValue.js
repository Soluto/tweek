import React from 'react';
import { inOp, within } from '../../../../../services/operators-provider';
import { types } from '../../../../../services/types-service';
import { TypedInput } from '../../../../common';
import './styles.css';

const chooseValueTypeByOperator = (operator, valueType) => {
  if (operator === inOp.operatorValue) {
    return { ...types.array, ofType: valueType };
  }
  if (operator === within.operatorValue) {
    return types.string;
  }

  return valueType;
};

const PropertyValue = ({ selectedOperator, valueType, ...props }) => (
  <div className="property-value-wrapper">
    <TypedInput
      data-comp="property-value"
      valueType={chooseValueTypeByOperator(selectedOperator, valueType)}
      {...props}
    />
  </div>
);

PropertyValue.defaultProps = {
  placeholder: 'Value',
  value: '',
};

export default PropertyValue;
