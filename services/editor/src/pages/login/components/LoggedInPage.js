import React, { useEffect } from 'react';
import { processSigninRedirectCallback } from '../../../services/auth-service';

const LoggedInPage = ({ history }) => {
  useEffect(() => {
    processSigninRedirectCallback().then(({ state }) => {
      const redirect = (state && state.redirect) || '/';
      history.replace(redirect);
    });
  }, []);

  return null;
};

export default LoggedInPage;
