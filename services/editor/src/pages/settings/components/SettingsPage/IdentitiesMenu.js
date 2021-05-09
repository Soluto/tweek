import React from 'react';
import { Link } from 'react-router-dom';
import { useIdentities, useRefreshSchemas } from '../../../../contexts/Schema/Schemas';
import AddIdentity from './AddIdentity';

const IdentityLinkItem = ({ type }) => (
  <li key={type}>
    <Link data-identity-type={type} to={`/settings/identities/${type}`}>
      {type}
    </Link>
  </li>
);

const IdentitiesMenu = () => {
  useRefreshSchemas();
  const identities = useIdentities();

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

export default IdentitiesMenu;
