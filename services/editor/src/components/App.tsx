import React, { FunctionComponent } from 'react';
import { CurrentUserProvider } from '../contexts/CurrentUser';
import { useRefreshSchemas } from '../contexts/Schema/Schemas';
import { TweekProvider } from '../contexts/Tweek';
import withLoading from '../hoc/with-loading';
import { refreshTypes } from '../services/types-service';
import '../styles/core/fonts/fonts.css';
import './App.css';
import AppHeader from './AppHeader';
import AppPage from './AppPage';
import { useGoogleTagManager } from './GoogleTagManager';

const AppContainer: FunctionComponent = ({ children }) => {
  useGoogleTagManager();
  useRefreshSchemas();

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

const enhance = withLoading(refreshTypes);

const App = enhance(AppWithProviders);

export default App;
