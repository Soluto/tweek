import React, { useEffect, useState } from 'react';
import { Redirect } from 'react-router';
import { processSigninRedirectCallback } from '../../../services/auth-service';

const LoggedInPage = () => {
  const [redirectUrl, setRedirectUrl] = useState('');
  useEffect(() => {
    processSigninRedirectCallback().then(({ state }) => {
      const redirect = (state && state.redirect) || { pathname: '/' };
      setRedirectUrl(`${redirect.pathname}${redirect.hash || redirect.search || ''}`);
    });
  }, []);

  return redirectUrl ? <Redirect to={redirectUrl} /> : null;
};

export default LoggedInPage;
