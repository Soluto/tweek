import axios from 'axios'
export default (key) => async function (dispatch, getState) {
  const { selectedKey: keyData } = getState()
  await axios.put(`/api/keys/${key}`, keyData)
}
