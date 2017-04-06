import React from 'react';
import classNames from 'classnames';
import { connect } from "react-redux";

const IdentityPage = ({params:{identityType}, allProperties}) => {
  let propertyTypes = allProperties.filter((property) => (property.identity === identityType));
  return (
      <div>
        {identityType}
      </div>
    );
};

export default connect((state) => ({
    allProperties: state.schema.properties
}))
(IdentityPage);
