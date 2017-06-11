import React from 'react';
import './IdentityProperty.css';
import ComboBox from '../../../../../components/common/ComboBox/ComboBox';
import * as TypesServices from '../../../../../services/types-service';

const PropertyTypeName = ({ name }) =>
  <span className="property-type-name-label">
    {name}
  </span>;

const PropertyTypeSelector = ({ type }) => {
  const suggestions = [...Object.keys(TypesServices.types), 'custom'];
  return (
    <ComboBox
      value={type.type}
      filterBy={() => true}
      valueType="string"
      suggestions={suggestions}
    />
  );
};

const IdentityProperty = ({ name, type, onUpdate }) =>
  <div className="property-type-wrapper">
    <PropertyTypeName name={name} />
    <PropertyTypeSelector type={type} />
  </div>;

export default IdentityProperty;
