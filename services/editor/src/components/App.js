/* global Promise */
import styled from '@emotion/styled';
import React from 'react';
import { Observable } from 'rxjs/Rx';
import { setObservableConfig, compose } from 'recompose';
import { TweekProvider } from '../contexts/Tweek';
import { CurrentUserProvider } from '../contexts/CurrentUser';
import withLoading from '../hoc/with-loading';
import { refreshSchema } from '../services/context-service';
import * as TypesService from '../services/types-service';
import AppHeader from './AppHeader/AppHeader';
import AppPage from './AppPage';
import ErrorPage from './ErrorPage';
import GoogleTagManager from './googleTagManager';
import { withTypesService } from './common/Input/TypedInput';
import '../styles/core/fonts/fonts.css';

setObservableConfig({
  fromESObservable: Observable.from,
});

const AppContainer = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
`;

const App = ({ children }) => (
  <CurrentUserProvider>
    <TweekProvider>
      <AppContainer>
        <GoogleTagManager />
        <AppHeader />
        <AppPage>{children}</AppPage>
      </AppContainer>
    </TweekProvider>
  </CurrentUserProvider>
);

const preload = async () => await Promise.all([TypesService.refreshTypes(), refreshSchema()]);

const errorRenderer = (error) => <ErrorPage error={error} />;

const enhance = compose(
  withLoading(() => <>Loading...</>, errorRenderer, preload),
  withTypesService(TypesService),
);

export default enhance(App);
