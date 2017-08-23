import { handleActions } from 'redux-actions';
import Chance from 'chance';
const chance = new Chance();

const ADD_ALERT = 'ADD_ALERT';
const REMOVE_ALERT = 'REMOVE_ALERT';

const buttons = {
  OK: {
    text: 'OK',
    value: true,
    className: 'rodal-confirm-btn',
    'data-alert-button': 'ok',
  },
  CANCEL: {
    text: 'Cancel',
    value: false,
    className: 'rodal-cancel-btn',
    'data-alert-button': 'cancel',
  },
};

export function showCustomAlert({ buttons, ...alertProps }) {
  return dispatch =>
    dispatch(
      new Promise((resolve) => {
        const id = chance.guid();
        const onClose = (result) => {
          resolve({ type: REMOVE_ALERT, id, result });
        };

        const alert = {
          ...alertProps,
          id,
          onClose: () => onClose(),
          buttons: buttons.map(({ value, ...props }) => ({
            ...props,
            onClick: () => onClose(value),
          })),
        };
        dispatch({ type: ADD_ALERT, alert });
      }),
    );
}

export function showAlert(alertProps) {
  return showCustomAlert({
    ...alertProps,
    showCloseButton: true,
    buttons: [buttons.OK],
  });
}

export function showConfirm(alertProps) {
  return showCustomAlert({
    ...alertProps,
    buttons: [buttons.OK, buttons.CANCEL],
  });
}

export default handleActions(
  {
    [ADD_ALERT]: (alerts, { alert }) => alerts.concat(alert),
    [REMOVE_ALERT]: (alerts, { id }) => alerts.filter(alert => alert.id !== id),
  },
  [],
);
