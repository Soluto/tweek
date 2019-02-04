import { Link } from 'react-router-dom';
import React from 'react';
import { compose, lifecycle, withPropsOnChange } from 'recompose';
import { connect } from 'react-redux';
import { loadSchema } from '../../../../store/ducks/schema';
import AddIdentity from './AddIdentity';

const IdentityLinkItem = ({ type }) => (
  <li key={type}>
    <Link data-identity-type={type} to={`/settings/identities/${type}`}>
      {type}
    </Link>
  </li>
);

const enhanceIdentities = compose(
  connect(
    (state) => ({ schema: state.schema }),
    { loadSchema },
  ),
  lifecycle({
    componentWillMount() {
      this.props.loadSchema();
    },
  }),
  withPropsOnChange(['schema'], ({ schema }) => ({
    identities: Object.entries(schema)
      .filter(([_, { remote }]) => remote !== null)
      .map(([type]) => type),
  })),
);

const IdentitiesMenu = ({ identities }) => (
  <ul style={{ flexGrow: 1 }} className="side-menu" key="SideMenu">
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
  </ul>
);

export default enhanceIdentities(IdentitiesMenu);
