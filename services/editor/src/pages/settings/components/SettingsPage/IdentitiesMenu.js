import React, { useEffect, useMemo } from 'react';
import { connect } from 'react-redux';
import { loadSchema } from '../../../../store/ducks/schema';
import AddIdentity from './AddIdentity';
import { MenuItem, MenuLinkItem } from './MenuGroup';

const IdentityLinkItem = ({ type }) => (
  <MenuLinkItem data-identity-type={type} to={`/settings/identities/${type}`}>
    {type}
  </MenuLinkItem>
);

const enhanceIdentities = connect((state) => ({ schema: state.schema }), { loadSchema });

const IdentitiesMenu = ({ loadSchema, schema }) => {
  useEffect(() => {
    loadSchema();
  }, []);

  const identities = useMemo(
    () =>
      Object.entries(schema)
        .filter(([_, { remote }]) => remote !== null)
        .map(([type]) => type),
    [schema],
  );

  return (
    <>
      {identities.map((identity) => (
        <IdentityLinkItem key={identity} type={identity} />
      ))}
      <MenuItem>
        <AddIdentity />
      </MenuItem>
    </>
  );
};

export default enhanceIdentities(IdentitiesMenu);
