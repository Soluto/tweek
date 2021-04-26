import cogoToast from 'cogo-toast';
import { useEffect } from 'react';
import { FetchError } from 'tweek-client';

export const formatError = (error: any): string => {
  if (!error) {
    return '';
  }
  if (error instanceof FetchError) {
    return `${error.response.status}: ${error.response.statusText}`;
  }
  return error.message || error.toString();
};

export const showError = (error: unknown, title = 'An error has occurred') => {
  cogoToast.error(formatError(error), { heading: title });
};

export default (error: unknown, title = 'An error has occurred') => {
  useEffect(() => {
    if (!error) {
      return;
    }

    showError(error, title);
  }, [error]);
};
