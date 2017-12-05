import React from 'react';
import { Observable } from 'rxjs/Rx';
import { setObservableConfig, compose } from 'recompose';
import { withRouter } from 'react-router-dom';

import registerServiceWorker from '../registerServiceWorker';
import withLoading from '../hoc/with-loading';
import { isAuthenticated } from '../services/auth-service';
import { refreshSchema } from '../services/context-service';
import * as TypesService from '../services/types-service';
import AppHeader from './AppHeader';
import AppPage from './AppPage';
import GoogleTagManager from './googleTagManager';

import { withTypesService } from './common/Input/TypedInput';
import '../styles/core/fonts/fonts.css';
import './App.css';

setObservableConfig({
  fromESObservable: Observable.from,
});


const App = ({ children }) =>
  (<div className={'app'}>
    <GoogleTagManager />
    <AppHeader />
    <AppPage children={children} />
  </div>
  );

const preload = async (props) => {
  const res = await isAuthenticated();
  if(res) {
    registerServiceWorker();
    return await Promise.all([TypesService.refreshTypes(), refreshSchema()]);
  }
  props.history.push('/login');
  return;
};

const enhance = compose(
  withRouter,
  withLoading(() => null, preload),
  withTypesService(TypesService),
);

export default enhance(App);