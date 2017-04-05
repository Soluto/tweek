import React from 'react';
import classNames from 'classnames';
import { connect } from "react-redux";

const IdentityPage = ({params:{identity}, allProperties}) => {
  let properties = allProperties.filter((property) => (property.identity === identity));
  return (
      <div>
        {identity}
      </div>
    );
};

export default connect((state) => ({
    allProperties: state.schema.properties
}))
(IdentityPage);
