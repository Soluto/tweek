/* global process Promise */
import * as R from 'ramda';
import { handleActions } from 'redux-actions';
import { push } from 'react-router-redux';
import { tweekManagementClient } from '../../utils/tweekClients';
import { showError } from './notifications';

const GET_CONTEXT = 'GET_CONTEXT';
const CONTEXT_RECEIVED = 'CONTEXT_RECEIVED';

const SAVE_CONTEXT = 'SAVE_CONTEXT';
const CONTEXT_SAVED = 'CONTEXT_SAVED';

const UPDATE_CONTEXT = 'UPDATE_CONTEXT';

export const openContext = ({ identityType, identityId }) =>
  push(`/context/${identityType}/${identityId}`);

export const getContext = ({ identityType, identityId }) =>
  async function(dispatch) {
    dispatch({ type: GET_CONTEXT });
    try {
      const contextData = await tweekManagementClient.getContext(identityType, identityId);
      dispatch({ type: CONTEXT_RECEIVED, payload: contextData });
    } catch (error) {
      dispatch(showError({ title: 'Failed to retrieve context', error }));
      dispatch({ type: CONTEXT_RECEIVED });
    }
  };

export const updateContext = (payload) => ({ type: UPDATE_CONTEXT, payload });

export const saveContext = ({ identityType, identityId }) =>
  async function(dispatch, getState) {
    dispatch({ type: SAVE_CONTEXT });
    const context = getState().context;

    const getDeletedKeys = R.pipe(
      R.unapply(R.map(R.keys)),
      R.apply(R.difference),
    );
    const getModifiedKeys = R.pipe(
      R.unapply(R.map(R.toPairs)),
      R.apply(R.difference),
      R.pluck(0),
    );

    const keysToDelete = getDeletedKeys(context.remote, context.local);
    const modifiedKeys = getModifiedKeys(context.local, context.remote);

    try {
      if (modifiedKeys.length > 0) {
        await tweekManagementClient.appendContext(
          identityType,
          identityId,
          R.pickAll(modifiedKeys, context.local),
        );
      }

      await Promise.all(
        keysToDelete.map((key) =>
          tweekManagementClient.deleteContextProperty(identityType, identityId, key),
        ),
      );

      dispatch({ type: CONTEXT_SAVED, success: true });
    } catch (error) {
      dispatch(showError({ title: 'Failed to update context', error }));
      dispatch({ type: CONTEXT_SAVED, success: false });
    }
  };

export default handleActions(
  {
    [GET_CONTEXT]: (state) => ({
      ...state,
      isGettingContext: true,
    }),

    [CONTEXT_RECEIVED]: (state, action) => ({
      ...state,
      local: action.payload,
      remote: action.payload,
      isGettingContext: false,
    }),

    [UPDATE_CONTEXT]: (state, action) => ({
      ...state,
      local: action.payload,
    }),

    [SAVE_CONTEXT]: (state) => ({
      ...state,
      isSavingContext: true,
    }),

    [CONTEXT_SAVED]: (state, action) => ({
      ...state,
      remote: action.success ? state.local : state.remote,
      isSavingContext: false,
    }),
  },
  {
    isGettingContext: false,
    local: null,
    remote: null,
    isSavingContext: false,
  },
);
