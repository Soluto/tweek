import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { loadSchema } from '../../../../store/ducks/schema';
import AddIdentity from './AddIdentity';

const IdentityLinkItem = ({ type }) => (
  <li key={type}>
    <Link data-identity-type={type} to={`/settings/identities/${type}`}>
      {type}
    </Link>
  </li>
);

const enhanceIdentities = connect((state) => ({ schema: state.schema }), { loadSchema });

const IdentitiesMenu = ({ schema, loadSchema }) => {
  useEffect(() => {
    loadSchema();
  }, []); //eslint-disable-line react-hooks/exhaustive-deps

  const identities = Object.entries(schema)
    .filter(([_, { remote }]) => remote !== null)
    .map(([type]) => type);

  return (
    <li>
      <div data-comp="group">Identities</div>
      <ul>
        {identities.map((identity) => (
          <IdentityLinkItem key={identity} type={identity} />
        ))}
        <li>
          <AddIdentity />
        </li>
      </ul>
    </li>
  );
};

export default enhanceIdentities(IdentitiesMenu);
