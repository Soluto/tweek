import React from 'react';
import classNames from 'classnames';
import { connect } from "react-redux";
import { Link } from 'react-router';
import { Observable } from 'rxjs/Rx';

import style from './IdentitiesList.css';

const IdentityItem = ({name}) => {
  return (
    <div className={classNames(style['identity-link-wrapper'])}>
      <Link className={classNames(style['identity-link'], { [style['selected']]: true })}
        to={`/identities/${name}`}>
        {name}
      </Link>
    </div>
  );
};

const IdentitiesList = ({identities}) => {
  const listItems = identities
    .map((identitiy) => {
      return (
        <IdentityItem key={identitiy} name={identitiy} />
      )});

  return (
      <div className={style['identities-list-container']}>
        <ul>{listItems}</ul>
      </div>
    );
};

export default IdentitiesList;
