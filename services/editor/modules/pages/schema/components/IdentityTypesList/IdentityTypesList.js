import React from 'react';
import classNames from 'classnames';
import { connect } from "react-redux";
import { Link } from 'react-router';
import { Observable } from 'rxjs/Rx';

import style from './IdentityTypesList.css';

const IdentityTypeItem = ({identityType}) => {
  return (
    <div className={classNames(style['identity-type-link-wrapper'])}>
      <Link className={classNames(style['identity-type-link'], { [style['selected']]: true })}
        to={`/schema/${identityType}`}>
        {identityType}
      </Link>
    </div>
  );
};

const IdentityTypesList = ({identityTypes}) => {
  const listItems = identityTypes
    .map((identityType) => {
      return (
        <IdentityTypeItem key={identityType} identityType={identityType} />
      )});

  return (
      <div className={style['identity-types-list-container']}>
        <ul>{listItems}</ul>
      </div>
    );
};

export default IdentityTypesList;
