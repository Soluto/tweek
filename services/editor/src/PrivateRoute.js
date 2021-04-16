/* global process */
import React, { useEffect, useState } from 'react';
import { Route, useHistory } from 'react-router';
import { isAuthenticated } from './services/auth-service';

const PrivateRoute = (props) => {
  const [loading, setLoading] = useState(true);
  const history = useHistory();

  useEffect(() => {
    isAuthenticated().then((authenticated) => {
      if (authenticated) {
        setLoading(false);
      } else {
        history.replace({
          pathname: '/login',
          state: { redirect: history.location },
        });
      }
    });
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return <Route {...props} />;
};

export default PrivateRoute;
