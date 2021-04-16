import React, { useEffect } from 'react';
import { processSilentSigninCallback } from '../../../services/auth-service';

const SilentLoggedInPage = ({ history }) => {
  useEffect(() => {
    processSilentSigninCallback().then(() => history.replace('/'));
  }, []);

  return null;
};

export default SilentLoggedInPage;
