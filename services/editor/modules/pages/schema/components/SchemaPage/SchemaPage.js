import React from 'react';
import { Component } from 'react';
import * as actions from '../../../../store/ducks/schema';
import { connect } from 'react-redux';
import style from './SchemaPage.css';
import { compose, lifecycle } from 'recompose';
import withLoading from '../../../../hoc/with-loading';
import { refreshSchema } from '../../../../services/context-service';
import { Link } from 'react-router';

const isNode = new Function('try {return this===global;}catch(e){return false;}');

const LinkMenuItem = ({ path, name }) => (<li key={path} >
  <Link to={`/schema/${path}`} >
    {name}
  </Link>
</li>);

export default compose(
  connect(state => ({}), { ...actions }),
  withLoading(() => null, ({ loadSchema }) => isNode() ? Promise.resolve() : refreshSchema().then(loadSchema)),
  connect(state => ({ identities: state.schema.identities })),
  lifecycle({
    componentDidMount() {
      this.props.loadSchema();
    },
  }),
)((props) => {
  const { identities, children } = props;
  return (
    <div className={style['schema-page-container']}>
      <ul className={style['side-menu']} key="SideMenu">
        <li>
          <div>Identities</div>
          <ul>
              {
                identities.map(x => ({ path: `identities/${x}`, name: x })).map(LinkMenuItem)
            }
            </ul>
        </li>
      </ul>
      <div style={{ display: 'flex', flexGrow: 1 }} key="Page">
        {children}
      </div>
    </div>
  );
},
  );
