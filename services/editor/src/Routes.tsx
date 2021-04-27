import { ConnectedRouter } from 'connected-react-router';
import React from 'react';
import { Redirect, Route, RouteComponentProps, Switch } from 'react-router';
import LoggedInPage from './pages/login/components/LoggedInPage';
import LoginPage from './pages/login/components/LoginPage';
import SilentLoggedInPage from './pages/login/components/SilentLoggedInPage';
import PrivateRoutes from './PrivateRoutes';
import { signOut } from './services/auth-service';
import browserHistory from './store/browserHistory';
import './styles/styles.css';

const AuthResult = ({ match }: RouteComponentProps) => (
  <Switch>
    <Route path={`${match.path}/silent`} component={SilentLoggedInPage} />
    <Route component={LoggedInPage} />
  </Switch>
);

const Routes = () => (
  <ConnectedRouter history={browserHistory}>
    <Switch>
      <Route path="/login" component={LoginPage} />
      <Route path="/auth-result" render={AuthResult} />
      <Route
        path="/logout"
        exact
        render={() => {
          signOut();
          return <Redirect to="/login" />;
        }}
      />
      <Route component={PrivateRoutes} />
    </Switch>
  </ConnectedRouter>
);

export default Routes;
