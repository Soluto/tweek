import { handleActions } from 'redux-actions';
import { FetchError } from 'tweek-client';

const ADD_NOTIFICATION = 'ADD_NOTIFICATION';

export const formatError = (error) =>
  error instanceof FetchError
    ? `${error.response.status}: ${error.response.statusText}`
    : (error && error.message) || error;

export default handleActions(
  {
    [ADD_NOTIFICATION]: (state, { notification }) => ({ notification }),
  },
  {},
);
