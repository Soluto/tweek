import React from 'react';
import { Component } from 'react';
import { connect } from 'react-redux';
import style from './IdentitiesPage.css';
import { compose } from 'recompose';
import withLoading from '../../../../hoc/with-loading';
import { refreshTypes } from '../../../../services/types-service';
import { refreshSchema } from "../../../../services/context-service";

const isNode=new Function("try {return this===global;}catch(e){return false;}");

export default compose(
  withLoading(() => null, isNode() ? Promise.resolve() : refreshTypes()),
  withLoading(() => null, isNode() ? Promise.resolve() : refreshSchema())
)
(class IdentitiesPage extends Component {
    constructor(props) {
      super(props);
    }

    componentDidMount() {
    }

    render() {
      return (
        <div className={style['identities-page-container']}>
        </div>
      );
    }
  });
