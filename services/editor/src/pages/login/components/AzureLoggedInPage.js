import React, { useEffect } from 'react';
import { getAzureState, getAzureToken } from '../../../services/auth-service';

const AzureLoggedInPage = ({ history }) => {
  useEffect(() => {
    const { state } = getAzureState();
    getAzureToken();
    const redirect = (state && state.redirect) || '/';
    history.replace(redirect);
  }, []);

  return null;
};

export default AzureLoggedInPage;
