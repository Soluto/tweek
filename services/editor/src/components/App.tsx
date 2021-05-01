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
import GoogleTagManager from './googleTagManager';

setObservableConfig({
  fromESObservable: Observable.from,
});

const AppComponent: FunctionComponent = ({ children }) => (
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

const preload = () => Promise.all([TypesService.refreshTypes(), refreshSchema()]);

const enhance = withLoading(preload);

const App = enhance(AppComponent);

export default App;
