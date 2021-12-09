import React, { useEffect } from 'react';
import { RouteComponentProps } from 'react-router';
import Loader from '../../../components/Loader';
import { getClient } from '../../../services/auth-service';
import { showError } from '../../../utils';

const LoggedInPage = ({ history }: RouteComponentProps) => {
  useEffect(() => {
    const client = getClient();
    if (!client) {
      return history.replace('/login');
    }

    client
      .processRedirect()
      .then((result) => {
        history.replace(result?.redirect || '/');
      })
      .catch((err: unknown) => {
        console.error('failed to process redirect', err);
        history.replace('/login');
        showError(err, 'Failed to log in');
      });
  }, []); //eslint-disable-line react-hooks/exhaustive-deps

  return <Loader />;
};

export default LoggedInPage;
