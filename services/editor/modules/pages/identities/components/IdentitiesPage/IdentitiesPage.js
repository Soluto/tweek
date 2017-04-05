import React from 'react';
import { Component } from 'react';
import { connect } from 'react-redux';
import IdentitiesList from '../IdentitiesList/IdentitiesList';
import style from './IdentitiesPage.css';
import { compose } from 'recompose';
import withLoading from '../../../../hoc/with-loading';
import { refreshSchema } from "../../../../services/context-service";

const isNode=new Function("try {return this===global;}catch(e){return false;}");

export default compose(
  withLoading(() => null, isNode() ? Promise.resolve() : refreshSchema())
)
(class IdentitiesPage extends Component {
    constructor(props) {
      super(props);
    }

    /*componentDidMount() {
      if (!this.props.identities) {
        this.props.getIdentities(['device','tech']);
      }
    }*/

    render() {
      return (
        <div className={style['identities-page-container']}>
          <div key="IdentitiesList" className={style['identities-list']}>
            <div className={style['identities-list-wrapper']}>
              <IdentitiesList identities={[{name: 'device'},{name: 'tech'}]} />
            </div>
          </div>
        </div>
      );
    }
  });
