import React, { useEffect, useState } from 'react';
import { Redirect, Route, RouteComponentProps, Switch } from 'react-router';
import App from './components/App';
import Loader from './components/Loader';
import NoMatch from './components/NoMatch';
import ContextPage from './pages/context/components/ContextPage/ContextPage';
import IdentityDetails from './pages/context/components/IdentityDetails/IdentityDetails';
import KeyPage from './pages/keys/components/KeyPage/KeyPage';
import KeysPage from './pages/keys/components/KeysPage/KeysPage';
import SearchResults from './pages/keys/components/SearchResults/SearchResults';
import EditExternalAppsPage from './pages/settings/components/ExternalAppsPage/EditExternalAppPage';
import ExternalAppsPage from './pages/settings/components/ExternalAppsPage/ExternalAppsPage';
import EditHookPage from './pages/settings/components/HooksPage/EditHookPage';
import HooksPage from './pages/settings/components/HooksPage/HooksPage';
import IdentityPage from './pages/settings/components/IdentityPage/IdentityPage';
import PoliciesPage from './pages/settings/components/PoliciesPage/PoliciesPage';
import SettingsPage from './pages/settings/components/SettingsPage/SettingsPage';
import { getClient } from './services/auth-service';

const SelectKeyMessage = () => <div className={'select-key-message'}>Select key...</div>;

const renderKeyRoutes = ({ match: { path } }: RouteComponentProps) => (
  <KeysPage>
    <Switch>
      <Route exact path={path} component={SelectKeyMessage} />
      <Route path="/keys/$search/:query" component={SearchResults} />
      <Route component={KeyPage} />
    </Switch>
  </KeysPage>
);

const renderContextRoutes = ({ match: { params, ...match } }: RouteComponentProps) => (
  <ContextPage {...params} {...match}>
    <Route path={`${match.path}/:identityType/:identityId`} component={IdentityDetails} />
  </ContextPage>
);

const renderSettingsRoutes = ({ match }: RouteComponentProps) => (
  <SettingsPage {...match}>
    <Route path={`${match.path}/identities/:identityType`} component={IdentityPage} />
    <Route path={`${match.path}/policies`} component={PoliciesPage} />
    <Route exact path={`${match.path}/hooks`} component={HooksPage} />
    <Route path={`${match.path}/hooks/edit`} component={EditHookPage} />
    <Route exact path={`${match.path}/externalApps`} component={ExternalAppsPage} />
    <Route path={`${match.path}/externalApps/edit`} component={EditExternalAppsPage} />
  </SettingsPage>
);

const PrivateRoutes = ({ history, location }: RouteComponentProps) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const client = getClient();
    if (!client) {
      return history.replace({
        pathname: '/login',
        state: { redirect: location },
      });
    }

    client.getAuthToken({ redirect: location }).then((token) => {
      if (token) {
        setLoading(false);
      }
    });
  }, [location.pathname]); //eslint-disable-line react-hooks/exhaustive-deps

  return (
    <App>
      {loading ? (
        <Loader />
      ) : (
        <Switch>
          <Route path="/" exact render={() => <Redirect to="/keys" />} />
          <Route path="/keys" render={renderKeyRoutes} />
          <Route path="/context" render={renderContextRoutes} />
          <Route path="/settings" render={renderSettingsRoutes} />
          <Route component={NoMatch} />
        </Switch>
      )}
    </App>
  );
};

export default PrivateRoutes;
