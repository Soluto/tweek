import React from 'react';
import { compose, mapProps } from 'recompose';
import withLoading from '../../../../hoc/with-loading';
import { refreshIndex } from '../../../../services/search-service';
import { refreshSchema } from '../../../../services/context-service';
import SearchBox from './SearchBox/SearchBox';
import style from './ContextPage.css';

const ContextPage = ({ children, ...props }) => (
  <div className={style['context-page-container']}>
    <div className={style['context-page']}>
      <SearchBox {...props} />
      {children ? <div className={style['horizontal-separator']} /> : null}
      {children}
    </div>
  </div>
);

export default compose(
  withLoading(() => null, Promise.all([refreshIndex(), refreshSchema()])),
  mapProps(({ children, params }) => ({ ...params, children })),
)(ContextPage);
