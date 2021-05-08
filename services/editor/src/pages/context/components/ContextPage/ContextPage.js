import React from 'react';
import DocumentTitle from 'react-document-title';
import { Route } from 'react-router';
import withLoading from '../../../../hoc/with-loading';
import { refreshSchema } from '../../../../services/context-service';
import './ContextPage.css';
import SearchBox from './SearchBox/SearchBox';

const ContextPage = ({ children, isExact, path }) => (
  <DocumentTitle title="Tweek - Context">
    <div className={'context-page-container'}>
      <div className={'context-page'}>
        <Route path={`${path}/:identityType/:identityId`}>
          {({ match }) => (
            <SearchBox
              identityId={match?.params.identityId}
              identityType={match?.params.identityType}
            />
          )}
        </Route>
        {!isExact ? <div className={'horizontal-separator'} /> : null}
        {children}
      </div>
    </div>
  </DocumentTitle>
);

export default withLoading(refreshSchema)(ContextPage);
