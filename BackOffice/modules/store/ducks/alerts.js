import {handleActions} from 'redux-actions';
import Chance from 'chance';
const chance = new Chance();

const ADD_ALERT = 'ADD_ALERT';
const REMOVE_ALERT = 'REMOVE_ALERT';

const closeAlert = (dispatch, id, onClose) => (result) => {
  dispatch({type: REMOVE_ALERT, id});
  if (onClose) onClose(result);
};

export function showAlert({message}) {
  return (dispatch) => {
    const id = chance.guid();
    const onClose = closeAlert(dispatch, id);
    const alert = {
      id,
      message,
      buttons: [{
        value: 'OK',
        onClick: onClose,
        className: 'rodal-confirm-brn',
      }],
      onClose,
      showCloseButton: true,
    };
    dispatch({type: ADD_ALERT, alert});
  }
}

export function showConfirm({title, message, onResult, shouldShow = true}) {
  if (!shouldShow) {
    onResult(true);
    return;
  }

  return (dispatch) => {
    const id = chance.guid();
    const onClose = closeAlert(dispatch, id, onResult);
    const alert = {
      id,
      title,
      message,
      buttons: [{
        value: 'OK',
        onClick: () => onClose(true),
        className: 'rodal-confirm-brn',
      }, {
        value: 'Cancel',
        onClick: () => onClose(false),
        className: 'rodal-cancel-brn',
      }],
      onClose: () => onClose(false),
    };
    dispatch({type: ADD_ALERT, alert});
  }
}

export default handleActions({
  [ADD_ALERT]: (alerts, {alert}) => alerts.concat(alert),
  [REMOVE_ALERT]: (alerts, {id}) => alerts.filter(alert => alert.id !== id)
}, []);
