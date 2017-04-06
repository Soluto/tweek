import React from 'react';
import style from './IdentityPage.css';
import { connect } from "react-redux";
import PropertyType from "./PropertyType/PropertyType";

const IdentityPage = ({params:{identityType}, allProperties}) => {
  const propertyTypes = allProperties.filter((property) => (property.identity === identityType));

  return (
    <div className={style['property-types-list']}>
      {
          propertyTypes.map((property, i) =>
            <PropertyType key={i} property={property} />
          )
      }
    </div>);
};

export default connect((state) => ({
    allProperties: state.schema.properties
}))
(IdentityPage);
