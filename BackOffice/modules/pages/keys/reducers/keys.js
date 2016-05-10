import { handleActions } from 'redux-actions'

export default handleActions({
  KEYS_UPDATED: (state, action) => action.payload
}, [])
