import React from 'react';
import { Observable } from 'rxjs/Rx';
import { setObservableConfig, compose } from 'recompose';
import { connect } from 'react-redux';

import registerServiceWorker from '../registerServiceWorker';
import withLoading from '../hoc/with-loading';
import { isAuthenticated } from '../services/auth-service';
import { refreshSchema } from '../services/context-service';
import * as TypesService from '../services/types-service';
import { redirectToLogin } from '../store/ducks/login';
import AppHeader from './AppHeader';
import AppPage from './AppPage';
import GoogleTagManager from './googleTagManager';

import { withTypesService } from './common/Input/TypedInput';
import '../styles/core/fonts/fonts.css';
import './App.css';

setObservableConfig({
  fromESObservable: Observable.from,
});

const App = ({ children }) => (
  <div className={'app'}>
    <GoogleTagManager />
    <AppHeader />
    <AppPage children={children} />
  </div>
);

const preload = async ({ redirectToLogin }) => {
  const res = await isAuthenticated();
  if (res) {
    registerServiceWorker();
    return await Promise.all([TypesService.refreshTypes(), refreshSchema()]);
  }
  redirectToLogin();
  return;
};

const enhance = compose(
  connect(null, { redirectToLogin }),
  withLoading(() => null, preload),
  withTypesService(TypesService),
);

export default enhance(App);
