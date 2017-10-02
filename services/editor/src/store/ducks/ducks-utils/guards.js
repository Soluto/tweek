import { showConfirm } from '../alerts';

export const continueGuard = (shouldShowConfirmation, confirmationDetails, continueFlow) =>
  async function (dispatch, getState) {
    let shouldContinue = true;
    if(shouldShowConfirmation(getState())) {
      shouldContinue = (await dispatch(showConfirm(confirmationDetails))).result;
    }
    if(shouldContinue) {
      return dispatch(continueFlow);
    }
  };
