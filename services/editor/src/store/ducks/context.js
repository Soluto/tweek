import { handleActions } from 'redux-actions';
import { push } from 'react-router-redux';
import jsonpatch from 'fast-json-patch';
import fetch from '../../utils/fetch';
import { showError } from './notifications';

const GET_CONTEXT = 'GET_CONTEXT';
const CONTEXT_RECEIVED = 'CONTEXT_RECEIVED';

const SAVE_CONTEXT = 'SAVE_CONTEXT';
const CONTEXT_SAVED = 'CONTEXT_SAVED';

const UPDATE_CONTEXT = 'UPDATE_CONTEXT';

export const openContext = ({ identityType, identityId }) =>
  push(`/context/${identityType}/${identityId}`);

export const getContext = ({ identityType, identityId }) =>
  async function (dispatch) {
    dispatch({ type: GET_CONTEXT });
    try {
      const response = await fetch(
        `/api/context/${identityType}/${encodeURIComponent(identityId)}`,
      );
      const contextData = await response.json();
      dispatch({ type: CONTEXT_RECEIVED, payload: contextData });
    } catch (error) {
      dispatch(showError({ title: 'Failed to retrieve context', error }));
      dispatch({ type: CONTEXT_RECEIVED });
    }
  };

export const updateContext = payload => ({ type: UPDATE_CONTEXT, payload });

export const saveContext = ({ identityType, identityId }) =>
  async function (dispatch, getState) {
    dispatch({ type: SAVE_CONTEXT });
    const context = getState().context;
    const encodedIdentityId = encodeURIComponent(identityId);

    const contextPatch = jsonpatch.compare(context.remote, context.local);
    try {
      await fetch(`/api/context/${identityType}/${encodedIdentityId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contextPatch),
      });
      dispatch({ type: CONTEXT_SAVED, success: true });
    } catch (error) {
      dispatch(showError({ title: 'Failed to update context', error }));
      dispatch({ type: CONTEXT_SAVED, success: false });
    }
  };

export default handleActions(
  {
    [GET_CONTEXT]: state => ({
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

    [SAVE_CONTEXT]: state => ({
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
