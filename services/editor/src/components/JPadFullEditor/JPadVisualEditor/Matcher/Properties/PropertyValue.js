import React from 'react';
import TypedInput from '../../../../../components/common/Input/TypedInput';
import { inOp } from '../../../../../services/operators-provider';
import { types } from '../../../../../services/types-service';
import './styles.css';

const PropertyValue = ({ selectedOperator, valueType, ...props }) => (
  <div className="property-value-wrapper">
    <TypedInput
      data-comp="property-value"
      valueType={
        selectedOperator === inOp.operatorValue ? { ...types.array, ofType: valueType } : valueType
      }
      selectedOperator={selectedOperator}
      {...props}
    />
  </div>
);

PropertyValue.defaultProps = {
  placeholder: 'Value',
  value: '',
};

export default PropertyValue;
