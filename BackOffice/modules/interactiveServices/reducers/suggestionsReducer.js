import { handleActions } from 'redux-actions';

export default handleActions({
    REPLACE_SUGGESTIONS: (state, action) => action.payload,
}, [])