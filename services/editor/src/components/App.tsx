import React, { FunctionComponent } from 'react';
import { setObservableConfig } from 'recompose';
import { Observable } from 'rxjs/Rx';
import { CurrentUserProvider } from '../contexts/CurrentUser';
import { TweekProvider } from '../contexts/Tweek';
import withLoading from '../hoc/with-loading';
import { refreshSchema } from '../services/context-service';
import * as TypesService from '../services/types-service';
import '../styles/core/fonts/fonts.css';
import './App.css';
import AppHeader from './AppHeader';
import AppPage from './AppPage';
import { useGoogleTagManager } from './GoogleTagManager';

setObservableConfig({
  fromESObservable: Observable.from,
});

const AppContainer: FunctionComponent = ({ children }) => {
  useGoogleTagManager();

  return (
    <div className="app">
      <AppHeader />
      <AppPage>{children}</AppPage>
    </div>
  );
};

const AppWithProviders: FunctionComponent = ({ children }) => (
  <CurrentUserProvider>
    <TweekProvider>
      <AppContainer>{children}</AppContainer>
    </TweekProvider>
  </CurrentUserProvider>
);

const preload = () => Promise.all([TypesService.refreshTypes(), refreshSchema()]);

const enhance = withLoading(preload);

const App = enhance(AppWithProviders);

export default App;
