import React from 'react';
import { ValueType } from 'tweek-client';
import { inOp, within } from '../../../../../services/operators-provider';
import { types } from '../../../../../services/types-service';
import { TypedInput } from '../../../../common';
import './styles.css';

const chooseValueTypeByOperator = (operator: string, valueType: ValueType) => {
  if (operator === inOp.operatorValue) {
    return { ...types.array, ofType: valueType };
  }
  if (operator === within.operatorValue) {
    return types.string;
  }

  return valueType;
};

export type PropertyValueProps = {
  selectedOperator: string;
  value: any;
  valueType: ValueType;
  onChange: (value: any) => void;
};

const PropertyValue = ({ selectedOperator, valueType, ...props }: PropertyValueProps) => (
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
