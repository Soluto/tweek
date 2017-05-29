import React from 'react';
import classNames from 'classnames';
import { Link } from 'react-router';

import style from './IdentityTypesItem.css';

export default ({name:identityType}) => {
  return (
    <div className={classNames(style['identity-type-link-wrapper'])}>
      <Link className={classNames(style['identity-type-link'], { [style['selected']]: true })}
        to={`/schema/${identityType}`}>
        {identityType}
      </Link>
    </div>
  );
};