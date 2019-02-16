import { handleActions } from 'redux-actions';
import { FetchError } from "tweek-client";
import Chance from 'chance';
const chance = new Chance();

const ADD_NOTIFICATION = 'ADD_NOTIFICATION';

const defaultFormat = (error)=> (error instanceof FetchError) ? 
`${error.response.status}: ${error.response.statusText}` :
 error && error.message

export function showError({ error, title = 'Error', position = 'br', format = defaultFormat})  {

  const notification = {
    title,
    message: format(error),
    level: 'error',
    position,
    autoDismiss: 0,
    uid: chance.guid(),
  };
  return { type: ADD_NOTIFICATION, notification };
}

export default handleActions(
  {
    [ADD_NOTIFICATION]: (state, { notification }) => ({ notification }),
  },
  {},
);
