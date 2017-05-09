import { handleActions } from 'redux-actions';
import fetch from '../../utils/fetch';
import { showError } from './notifications';

const GET_CONTEXT = 'GET_CONTEXT';
const CONTEXT_RECEIVED = 'CONTEXT_RECEIVED';

const UPDATE_CONTEXT = 'UPDATE_CONTEXT';
const CONTEXT_UPDATED = 'CONTEXT_UPDATED';

export const getContext = ({ contextType, contextId }) => async function (dispatch) {
  dispatch({ type: GET_CONTEXT });
  try {
    const response = await fetch(`/api/context/${contextType}/${encodeURIComponent(contextId)}`, { credentials: 'same-origin' });
    const contextData = await response.json();
    dispatch({ type: CONTEXT_RECEIVED, payload: { contextData } });
  } catch (error) {
    dispatch(showError({ title: 'Failed to retrieve context', error }));
    dispatch({ type: CONTEXT_RECEIVED });
  }
};

export const updateContext = ({ contextType, contextId, updatedContextData, deletedContextKeys }) => async function (dispatch) {
  dispatch({ type: UPDATE_CONTEXT });
  const encodedContextId = encodeURIComponent(contextId);

  try {
    await Promise.all([
      ...deletedContextKeys
        .map(encodeURIComponent)
        .map(key => fetch(`/api/context/${contextType}/${encodedContextId}/${key}`, {
          credentials: 'same-origin',
          method: 'DELETE',
        })),

      fetch(`/api/context/${contextType}/${encodedContextId}`, {
        credentials: 'same-origin',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedContextData),
      }),
    ]);
    dispatch({ type: CONTEXT_UPDATED, payload: { contextData: updatedContextData } });
  } catch (error) {
    dispatch(showError({ title: 'Failed to update context', error }));
    dispatch({ type: CONTEXT_UPDATED });
  }
};

export default handleActions({
  [GET_CONTEXT]: state => ({
    ...state,
    isGettingContext: true,
  }),
  [CONTEXT_RECEIVED]: (state, action) => ({
    ...state,
    contextData: action.payload ? action.payload.contextData : state.contextData,
    isGettingContext: false,
  }),

  [UPDATE_CONTEXT]: state => ({
    ...state,
    isUpdatingContext: true,
  }),

  [CONTEXT_UPDATED]: (state, action) => ({
    ...state,
    contextData: action.payload ? action.payload.contextData : state.contextData,
    isUpdatingContext: false,
  }),
}, {
  isGettingContext: false,
  contextData: {},
  isUpdatingContext: false,
});
