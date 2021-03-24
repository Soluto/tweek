/* global process */
import React from 'react';
import { Route, Redirect } from 'react-router';
import { mapPropsStream } from 'recompose';
import { Observable } from 'rxjs';
import { getClient } from './services/auth-service';

const PrivateRoute = ({ component: Component, render, isAuthenticated, location, ...rest }) => (
  <Route
    {...rest}
    render={(props) =>
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

const enhance = mapPropsStream((props$) => {
  const isAuthenticated$ = Observable.defer(() => {
    const client = getClient();
    return client && client.isAuthenticated();
  });
  return props$.switchMap((props) =>
    isAuthenticated$.map((isAuthenticated) => ({ ...props, isAuthenticated })),
  );
});

export default enhance(PrivateRoute);
