import { handleActions } from 'redux-actions';

const GET_CONTEXT = "GET_CONTEXT";
const CONTEXT_RECEIVED = "CONTEXT_RECEIVED";

const UPDATE_CONTEXT = "UPDATE_CONTEXT";
const CONTEXT_UPDATED = "CONTEXT_UPDATED";

export const getContext = ({ contextType, contextId }) => async function (dispatch) {
    dispatch({ type: GET_CONTEXT });
    let response = await fetch(`/api/context/${contextType}/${contextId}`, { credentials: 'same-origin' });
    const contextData = await response.json()
    dispatch({ type: CONTEXT_RECEIVED, payload: { contextData } });
};

export const updateContext = ({ contextType, contextId, contextData }) => async function(dispatch){
    dispatch({ type: UPDATE_CONTEXT });

    await fetch(`/api/context/${contextType}/${contextId}`, {
      credentials: 'same-origin',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(contextData) 
    })

    dispatch({ type: CONTEXT_UPDATED });
    dispatch(getContext({ contextType, contextId }));
}

export default handleActions({
    [GET_CONTEXT]: (state, action) => ({
        ...state,
        isGettingContext: true        
    }),
    [CONTEXT_RECEIVED]: (state, action) => ({
        ...state,
        contextData: action.payload.contextData,
        isGettingContext: false
    }),

    [UPDATE_CONTEXT]: (state, action) => ({
        ...state,
        isUpdatingContext: true
    }),

    [CONTEXT_UPDATED]: (state, action) => ({
        ...state,
        isUpdatingContext: false
    })
}, {
    isGettingContext: false,
    contextData: {},

    isUpdatingContext: false
});