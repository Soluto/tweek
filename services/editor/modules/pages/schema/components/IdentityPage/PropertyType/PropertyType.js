import React from 'react';
import style from './PropertyType.css';
import ComboBox from '../../../../../components/common/ComboBox/ComboBox';
import * as TypesServices from '../../../../../services/types-service';

const PropertyTypeName = ({ name }) => (
  <span className={style['property-type-name-label']}>
    {name}
  </span>
  );

const PropertyTypeSelector = ({ type }) => {
  const suggestions = [...Object.keys(TypesServices.types), 'custom'];
  return <ComboBox value={type} filterBy={() => true} valueType="string" suggestions={suggestions} />;
};

const PropertyType = ({ property }) => (
  <div className={style['property-type-wrapper']}>
    <PropertyTypeName name={property.name} />
    <PropertyTypeSelector type={property.type} />
  </div>
  );

export default PropertyType;
