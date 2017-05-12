import React from 'react';
import { mapProps } from 'recompose';
import SearchBox from './SearchBox/SearchBox';
import style from './ContextPage.css';

export default mapProps(({ children, params }) => ({ ...params, children }))(({ children, ...props }) => (
  <div className={style['context-page-container']}>
    <div className={style['context-page']}>
      <SearchBox {...props} />
      {children}
    </div>
  </div>
));
