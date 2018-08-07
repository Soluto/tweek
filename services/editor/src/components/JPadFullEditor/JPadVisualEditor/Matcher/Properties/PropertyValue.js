import React from 'react';
import TypedInput from '../../../../../components/common/Input/TypedInput';
import { inOp } from '../../../../../services/operators-provider';
import './styles.css';

const PropertyValue = ({ selectedOperator, ...props }) => (
  <div className="property-value-wrapper">
    <TypedInput
      data-comp="property-value"
      isArray={selectedOperator === inOp.operatorValue}
      {...props}
    />
  </div>
);

PropertyValue.defaultProps = {
  placeholder: 'Value',
  value: '',
};

export default PropertyValue;
