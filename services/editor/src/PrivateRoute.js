/* global process */
import React from 'react';
import { Route, Redirect } from 'react-router';
import { withProps } from 'recompose';
import { retrieveIdToken } from './services/auth-service';

const PrivateRoute = ({ component: Component, render, isAuthenticated, location, ...rest }) => (
  <Route
    {...rest}
    render={props =>
      isAuthenticated ? (
        Component ? (
          <Component {...props} />
        ) : (
          render(props)
        )
      ) : (
        <Redirect
          to={{
            pathname: '/login',
            state: { redirect: location },
          }}
        />
      )
    }
  />
);
const enhance = withProps(() => ({
  isAuthenticated: !!retrieveIdToken(),
}));

export default enhance(PrivateRoute);
