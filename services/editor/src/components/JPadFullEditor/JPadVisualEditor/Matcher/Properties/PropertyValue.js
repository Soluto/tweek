import React from 'react';
import TypedInput from '../../../../../components/common/Input/TypedInput';
import { inOp } from '../../../../../services/operators-provider';
import './styles.css';

const PropertyValue = ({ selectedOperator, ...props }) => {
  const { valueType } = props;
  return (
    <div className="property-value-wrapper">
      <TypedInput
        data-comp="property-value"
        isArray={selectedOperator === inOp.operatorValue || valueType.name === 'array'}
        {...props}
      />
    </div>
  );
};

PropertyValue.defaultProps = {
  placeholder: 'Value',
  value: '',
};

export default PropertyValue;
