import {handleActions} from 'redux-actions';
import Chance from 'chance';
const chance = new Chance();

const ADD_ALERT = 'ADD_ALERT';
const REMOVE_ALERT = 'REMOVE_ALERT';

const buttons = {
  OK: {
    text: 'OK',
    value: true,
    className: 'rodal-confirm-btn',
  },
  CANCEL: {
    text: 'Cancel',
    value: false,
    className: 'rodal-cancel-btn',
  }
};


function addAlert({buttons, onResult, shouldShow = true, ...alertProps}) {
  if (!shouldShow) {
    if (onResult) onResult(true);
    return;
  }

  return (dispatch) => {
    const id = chance.guid();
    const onClose = (result) => {
      dispatch({type: REMOVE_ALERT, id});
      if (onResult) onResult(result);
    };

    const alert = {
      ...alertProps,
      id,
      onClose,
      buttons: Array.isArray(buttons) ? buttons : buttons(onClose)
    };
    dispatch({type: ADD_ALERT, alert});
  }
}

export function showCustomAlert({buttons, ...alertProps}) {
  return addAlert({
    ...alertProps,
    buttons: onClose => buttons.map(({value, ...props}) => ({...props, onClick: () => onClose(value)}))
  });
}

export function showAlert(alertProps) {
  return showCustomAlert({
    ...alertProps,
    showCloseButton: true,
    buttons: [buttons.OK]
  });
}

export function showConfirm(alertProps) {
  return showCustomAlert({
    ...alertProps,
    buttons: [buttons.OK, buttons.CANCEL]
  });
}

export default handleActions({
  [ADD_ALERT]: (alerts, {alert}) => alerts.concat(alert),
  [REMOVE_ALERT]: (alerts, {id}) => alerts.filter(alert => alert.id !== id)
}, []);
