import React from 'react';
import TypedInput from '../../../common/Input/TypedInput';
import './DefaultValue.css';

const DefaultValue = props =>
  <div className="default-value-container">
    <label className="default-value-label">Default Value:</label>
    <TypedInput {...props} data-comp="default-value" />
  </div>;

export default DefaultValue;
