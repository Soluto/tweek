import React from 'react';
import { Component } from 'react';
import * as actions from '../../../../store/ducks/schema';
import { connect } from 'react-redux';
import style from './SchemaPage.css';
import { compose, lifecycle } from 'recompose';
import withLoading from '../../../../hoc/with-loading';
import { refreshSchema } from "../../../../services/context-service";
import DirectoryTreeView from "../../../keys/components/KeysList/DirectoryTreeView"
import IdentityTypesItem from './IdentityTypesItem';

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
      console.log(identities);
      return (
        <div className={style['schema-page-container']}>
          <div className={style['side-menu']} key="SideMenu">
            <DirectoryTreeView paths={identities.map(x=> `identities/${x}`)}
                renderItem={IdentityTypesItem}
                expandByDefault={true} />
          </div>
          <div key="Page">
            {children}
          </div>
        </div>
      );
    }
  );
