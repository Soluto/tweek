import React from 'react';
import { compose, mapProps, lifecycle } from 'recompose';
import withLoading from '../../../../hoc/with-loading';
import { refreshSchema } from '../../../../services/context-service';
import messages$ from '../../../../services/messages';
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
  withLoading(() => null, refreshSchema),
  lifecycle({
    componentDidMount() {
      this.disposable = messages$.filter(x => x === 'refresh').subscribe(_ => refreshSchema());
    },
    componentWillUnmount() {
      this.disposable.dispose();
    },
  }),
  mapProps(({ params, ...rest }) => ({ ...params, ...rest })),
)(ContextPage);
