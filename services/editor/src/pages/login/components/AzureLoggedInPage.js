import React, { useEffect, useState } from 'react';
import { Redirect } from 'react-router';
import { getAzureState, getAzureToken } from '../../../services/auth-service';

const AzureLoggedInPage = () => {
  const [redirectUrl, setRedirectUrl] = useState('');

  useEffect(() => {
    const { state } = getAzureState();
    getAzureToken();
    const redirect = (state && state.redirect) || { pathname: '/' };
    setRedirectUrl(`${redirect.pathname}${redirect.hash || redirect.search || ''}`);
  }, []);

  return redirectUrl ? <Redirect to={redirectUrl} /> : null;
};

export default AzureLoggedInPage;
