import { handleActions } from 'redux-actions';

export default handleActions({
    KEY_DOWNLOADED: (state, action) => action.payload,
    KEY_RULEDEF_UPDATED: (state, {payload})=> ({
        ...state,
        ruleDef:payload
    })
}, null)