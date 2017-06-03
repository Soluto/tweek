import { handleActions } from 'redux-actions';
import Chance from 'chance';
const chance = new Chance();

const ADD_NOTIFICATION = 'ADD_NOTIFICATION';

export function showError({ error, title = 'Error', position = 'br' }) {
  const notification = {
    title,
    message: `${error.status}: ${error.statusText}`,
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
