import React from 'react';
import classNames from 'classnames';
import { connect } from "react-redux";
import { getIdentities } from "../../../../services/context-service";

const IdentityPage = ({params:{identity}}) => {
  return (
      <div>
        {identity}
      </div>
    );
};

export default connect((state) => ({

}))
(IdentityPage);
