import { handleActions } from 'redux-actions';

export default handleActions({
    KEY_DOWNLOADED: (state, action) => action.payload
}, null)