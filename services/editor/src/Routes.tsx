import React from 'react';
import { Redirect, Route, RouteComponentProps, Switch } from 'react-router';
import { BrowserRouter as Router } from 'react-router-dom';
import LoggedInPage from './pages/login/components/LoggedInPage';
import LoginPage from './pages/login/components/LoginPage';
import SilentLoggedInPage from './pages/login/components/SilentLoggedInPage';
import PrivateRoutes from './PrivateRoutes';
import { signOut } from './services/auth-service';
import './styles/styles.css';

const AuthResult = ({ match }: RouteComponentProps) => (
  <Switch>
    <Route path={`${match.path}/silent`} component={SilentLoggedInPage} />
    <Route component={LoggedInPage} />
  </Switch>
);

const Routes = () => (
  <Router>
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
  </Router>
);

export default Routes;
