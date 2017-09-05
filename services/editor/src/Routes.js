import React from 'react';
import { Switch, Route, Redirect } from 'react-router';
import { ConnectedRouter } from 'react-router-redux';
import App from './components/App';
import KeysPage from './pages/keys/components/KeysPage/KeysPage';
import KeyPage from './pages/keys/components/KeyPage/KeyPage';
import ContextPage from './pages/context/components/ContextPage/ContextPage';
import IdentityDetails from './pages/context/components/IdentityDetails/IdentityDetails';
import SettingsPage from './pages/settings/components/SettingsPage/SettingsPage';
import IdentityPage from './pages/settings/components/IdentityPage/IdentityPage';
import NoMatch from './components/NoMatch';
import browserHistory from './store/browserHistory';
import GoogleTagManager from './components/googleTagManager';
import './styles/styles.css';

const SelectKeyMessage = () => <div className={'select-key-message'}>Select key...</div>;

export default props =>
  <ConnectedRouter history={browserHistory}>
    <App>
      <GoogleTagManager />
      <Switch>
        <Route path="/" exact render={() => <Redirect to="/keys" />} />
        <Route
          path="/keys"
          render={({ match: { path } }) =>
            <KeysPage>
              <Switch>
                <Route exact path={path} component={SelectKeyMessage} />
                <Route component={KeyPage} />
              </Switch>
            </KeysPage>}
        />
        <Route
          path="/context"
          render={({ match }) =>
            <ContextPage {...match}>
              <Route path={`${match.path}/:identityType/:identityId`} component={IdentityDetails} />
            </ContextPage>}
        />
        <Route
          path="/settings"
          render={({ match }) =>
            <SettingsPage {...match}>
              <Route path={`${match.path}/identities/:identityType`} component={IdentityPage} />
            </SettingsPage>}
        />

        <Route component={NoMatch} />
      </Switch>
    </App>
  </ConnectedRouter>;
