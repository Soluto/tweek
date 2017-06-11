import React from 'react';
import { Component } from 'react';
import * as actions from '../../../../store/ducks/schema';
import { connect } from 'react-redux';
import './SchemaPage.css';
import { compose, lifecycle } from 'recompose';
import withLoading from '../../../../hoc/with-loading';
import { refreshSchema } from '../../../../services/context-service';
import { Link } from 'react-router-dom';

const isNode = new Function('try {return this===global;}catch(e){return false;}');

const LinkMenuItem = ({ path, name }) =>
  <li key={path}>
    <Link to={`/schema/${path}`}>
      {name}
    </Link>
  </li>;

export default compose(
  connect(state => ({}), { ...actions }),
  withLoading(
    () => null,
    ({ loadSchema }) => (isNode() ? Promise.resolve() : refreshSchema().then(loadSchema)),
  ),
  connect(state => ({ schema: state.schema })),
  lifecycle({
    componentDidMount() {
      this.props.loadSchema();
    },
  }),
)((props) => {
  const { schema, children } = props;
  return (
    <div className="schema-page-container">
      <ul className="side-menu" key="SideMenu">
        <li>
          <div>Identities</div>
          <ul>
            {Object.keys(schema).map(x => ({ path: `identities/${x}`, name: x })).map(LinkMenuItem)}
          </ul>
        </li>
      </ul>
      <div style={{ display: 'flex', flexGrow: 1 }} key="Page">
        {children}
      </div>
    </div>
  );
});
