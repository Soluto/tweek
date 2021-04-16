import qs from 'query-string';
import { useEffect } from 'react';
import { storeToken } from '../../../services/auth-service';

const BasicAuthLoggedInPage = ({ location, history }) => {
  useEffect(() => {
    const { jwt, state } = qs.parse(location.search);
    storeToken(jwt);
    const redirect = JSON.parse(state).redirect || '/';
    history.replace(redirect);
  }, []);

  return null;
};

export default BasicAuthLoggedInPage;
