import React, { useEffect, useState } from 'react';
import { Redirect } from 'react-router';
import { processSilentSigninCallback } from '../../../services/auth-service';

const SilentLoggedInPage = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    processSilentSigninCallback().then(() => setLoading(false));
  }, []);

  return loading ? null : <Redirect to={'/'} />;
};

export default SilentLoggedInPage;
