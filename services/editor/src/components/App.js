/* global Promise */
import React from 'react';
import { Observable } from 'rxjs/Rx';
import { setObservableConfig, compose } from 'recompose';
import { TweekProvider } from '../contexts/Tweek';
import { CurrentUserProvider } from '../contexts/CurrentUser';
import withLoading from '../hoc/with-loading';
import { refreshSchema } from '../services/context-service';
import * as TypesService from '../services/types-service';
import AppHeader from './AppHeader';
import AppPage from './AppPage';
import ErrorPage from './ErrorPage';
import GoogleTagManager from './googleTagManager';
import { withTypesService } from './common/Input/TypedInput';
import '../styles/core/fonts/fonts.css';
import './App.css';

setObservableConfig({
  fromESObservable: Observable.from,
});

const App = ({ children }) => (
  <CurrentUserProvider>
    <TweekProvider>
      <div className={'app'}>
        <GoogleTagManager />
        <AppHeader />
        <AppPage children={children} />
      </div>
    </TweekProvider>
  </CurrentUserProvider>
);

const preload = async () => await Promise.all([TypesService.refreshTypes(), refreshSchema()]);

const errorRenderer = (error) => <ErrorPage error={error} />;

const enhance = compose(
  withLoading(() => null, errorRenderer, preload),
  withTypesService(TypesService),
);

export default enhance(App);
