import React from 'react';
import { Component } from 'react';
import * as actions from '../../../../store/ducks/schema';
import { connect } from 'react-redux';
import IdentitiesList from '../IdentitiesList/IdentitiesList';
import style from './SchemaPage.css';
import { compose, lifecycle } from 'recompose';
import withLoading from '../../../../hoc/with-loading';
import { refreshSchema } from "../../../../services/context-service";

const isNode = new Function("try {return this===global;}catch(e){return false;}");

export default compose(
  connect(state => ({}), { ...actions }),
  withLoading(() => null, ({loadSchema}) => isNode() ? Promise.resolve() : refreshSchema().then(loadSchema)),
  connect(state => ({identities: state.schema.identities})),
  lifecycle({
    componentDidMount(){
      this.props.loadSchema();
    }
  }),
)
( (props) => {
      const { identities, children } = props;
      return (
        <div className={style['identities-page-container']}>
          <div key="IdentitiesList" className={style['identities-list']}>
            <div className={style['identities-list-wrapper']}>
              <IdentitiesList identities={identities} />
            </div>
          </div>
          <div key="Page">
            {children}
          </div>
        </div>
      );
    }
  );
