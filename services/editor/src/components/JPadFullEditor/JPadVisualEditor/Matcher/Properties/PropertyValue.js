import React from 'react';
import TypedInput from '../../../../../components/common/Input/TypedInput';
import { inOp } from '../../../../../services/operators-provider';
import { types } from '../../../../../services/types-service';
import './styles.css';

const PropertyValue = ({ selectedOperator, valueType, ...props }) => (
  <div className="property-value-wrapper">
    <TypedInput
      data-comp="property-value"
      valueType={GetValueType(selectedOperator, valueType)}
      {...props}
    />
  </div>
);

const GetValueType = (selectedOperator, valueType) => {
  if (selectedOperator === inOp.operatorValue) {
    const { base, ...rest } = valueType;
    return { ...rest, ...types.array, ofType: valueType.base || valueType.name };
  }
  return valueType;
};

PropertyValue.defaultProps = {
  placeholder: 'Value',
  value: '',
};

export default PropertyValue;
