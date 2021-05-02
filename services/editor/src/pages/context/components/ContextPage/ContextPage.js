import React from 'react';
import DocumentTitle from 'react-document-title';
import withLoading from '../../../../hoc/with-loading';
import { refreshSchema } from '../../../../services/context-service';
import './ContextPage.css';
import SearchBox from './SearchBox/SearchBox';

const ContextPage = ({ children, isExact, ...props }) => (
  <DocumentTitle title="Tweek - Context">
    <div className={'context-page-container'}>
      <div className={'context-page'}>
        <SearchBox {...props} />
        {!isExact ? <div className={'horizontal-separator'} /> : null}
        {children}
      </div>
    </div>
  </DocumentTitle>
);

export default withLoading(refreshSchema)(ContextPage);
