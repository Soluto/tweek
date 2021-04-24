import cogoToast from 'cogo-toast';
import { useEffect } from 'react';
import { formatError } from '../store/ducks/notifications';

export default (error, title = 'An error has occurred') => {
  useEffect(() => {
    if (!error) {
      return;
    }

    cogoToast.error(formatError(error), { heading: title });
  }, [error]);
};
