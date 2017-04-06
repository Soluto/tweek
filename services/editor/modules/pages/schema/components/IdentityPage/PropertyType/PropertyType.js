import React from 'react';
import style from './PropertyType.css';

const PropertyTypeName = ({name}) => {
  return (
    <span className={style['property-type-name-label']}>
      {name}
    </span>
  );
};

const PropertyTypeSelector = ({type}) => {
  return (
    <div className={style['property-type-label']}>
      {type}
    </div>
  );
};

const PropertyType = ({property}) => {
  return (
    <div className={style['property-type-wrapper']}>
      <PropertyTypeName name={property.name} />
      <PropertyTypeSelector type={property.type} />
    </div>
  );
};

export default PropertyType;
