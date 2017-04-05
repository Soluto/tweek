import React from 'react';
import { Component } from 'react';
import * as actions from '../../../../store/ducks/identities';
import { connect } from 'react-redux';
import IdentitiesList from '../IdentitiesList/IdentitiesList';
import style from './IdentitiesPage.css';
import { compose, lifecycle } from 'recompose';
import withLoading from '../../../../hoc/with-loading';
import { refreshSchema, getIdentities } from "../../../../services/context-service";

const isNode = new Function("try {return this===global;}catch(e){return false;}");

export default compose(
  connect(state => ({identities: state.identities}), { ...actions }),
  withLoading(({loadIdentities}) => null, isNode() ? Promise.resolve() : refreshSchema()),
  lifecycle({
    componentDidMount(){
      const identities = getIdentities();
      this.props.loadIdentities(identities);
    }
  })
)
( (props) => {
      const { identities } = props;
      return (
        <div className={style['identities-page-container']}>
          <div key="IdentitiesList" className={style['identities-list']}>
            <div className={style['identities-list-wrapper']}>
              <IdentitiesList identities={identities} />
            </div>
          </div>
        </div>
      );
    }
  );
