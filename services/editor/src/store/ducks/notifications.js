import { handleActions } from 'redux-actions';
import Chance from 'chance';
const chance = new Chance();

const ADD_NOTIFICATION = 'ADD_NOTIFICATION';

export function showError({ error, title = 'Error', position = 'br', format = e=> `${e.status}: ${e.statusText}` }) {
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
