import React, { useEffect } from 'react';
import { RouteComponentProps } from 'react-router';
import Loader from '../../../components/Loader';
import { getClient } from '../../../services/auth-service';
import { OidcAuthClient } from '../../../services/auth/clients/oidc-auth-client';
import { showError } from '../../../utils';

const SilentLoggedInPage = ({ history }: RouteComponentProps) => {
  useEffect(() => {
    const client = getClient();
    if (client instanceof OidcAuthClient) {
      client
        .processSilentRedirect()
        .then(() => history.replace('/'))
        .catch((err: unknown) => {
          console.error('failed to process redirect', err);
          history.replace('/login');
          showError(err, 'Failed to log in');
        });
    } else {
      history.replace('/login');
    }
  }, []); //eslint-disable-line react-hooks/exhaustive-deps

  return <Loader />;
};

export default SilentLoggedInPage;
