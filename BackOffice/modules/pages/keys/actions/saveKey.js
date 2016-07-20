function withJSONdata(data) {
  return {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  };
}
export default (key) => async function (dispatch, getState) {
  const { selectedKey: keyData } = getState();
  await fetch(`/api/keys/${key}`, {
    method: 'put',
    ...withJSONdata(keyData),
  });
};
