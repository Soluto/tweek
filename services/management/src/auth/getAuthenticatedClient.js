const axios = require('axios');
const generateToken = require('./generateToken');

module.exports = async function(config = {}) {
  const token = await generateToken();
  const headers = Object.assign({}, config.headers, { Authorization: `Bearer ${token}` });
  return axios.create(Object.assign({}, config, { headers }));
};
