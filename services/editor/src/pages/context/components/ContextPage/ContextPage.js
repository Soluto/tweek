import React from 'react';
import { compose, mapProps } from 'recompose';
import withLoading from '../../../../hoc/with-loading';
import { refreshIndex } from '../../../../services/search-service';
import { refreshSchema } from '../../../../services/context-service';
import SearchBox from './SearchBox/SearchBox';
import './ContextPage.css';

const ContextPage = ({ children, isExact, ...props }) =>
  <div className={'context-page-container'}>
    <div className={'context-page'}>
      <SearchBox {...props} />
      {!isExact ? <div className={'horizontal-separator'} /> : null}
      {children}
    </div>
  </div>;

export default compose(
  withLoading(() => null, Promise.all([refreshIndex(), refreshSchema()])),
  mapProps(({ params, ...rest }) => ({ ...params, ...rest })),
)(ContextPage);
