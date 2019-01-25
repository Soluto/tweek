/* global Promise */
import React from 'react';
import { Observable } from 'rxjs/Rx';
import { setObservableConfig, compose, lifecycle } from 'recompose';
import withLoading from '../hoc/with-loading';
import { refreshSchema } from '../services/context-service';
import * as TypesService from '../services/types-service';
import { tweekManagementClient, tweekRepository } from '../utils/tweekClients';
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

const preload = async () => await Promise.all([TypesService.refreshTypes(), refreshSchema()]);

const enhance = compose(
  lifecycle({
    async componentDidMount() {
      const { User } = await tweekManagementClient.currentUser();
      await tweekRepository._waitRefreshCycle();
      tweekRepository.updateContext({ tweek_editor_user: User });
    },
  }),
  withLoading(() => null, preload),
  withTypesService(TypesService),
);

export default enhance(App);
