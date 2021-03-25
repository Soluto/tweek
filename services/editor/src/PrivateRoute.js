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
  return props$.switchMap(async (props) => {
    const client = getClient();
    if (!client) {
      return { ...props, isAuthenticated: false };
    }
    const authenticated = await client.isAuthenticated();
    if (authenticated) {
      return { ...props, isAuthenticated: true };
    }

    await client.signIn({ redirect: props.location });

    return { ...props, isAuthenticated: false };
  });
});

export default enhance(PrivateRoute);
