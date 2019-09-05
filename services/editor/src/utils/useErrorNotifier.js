import { useEffect, useContext } from 'react';
import { FetchError } from 'tweek-client';
import { ReduxContext } from '../store';
import { showError } from '../store/ducks/notifications';

export default (error, title = 'An error has occurred') => {
  const { dispatch } = useContext(ReduxContext);
  useEffect(() => {
    if (!error) return;

    const format =
      error instanceof FetchError
        ? ({ response: { status, statusText } }) => `${status}: ${statusText}`
        : (x) => x.message;

    dispatch(showError({ title, error, format }));
  }, [error]);
};
