const axios = require('axios');
const generateToken = require('./generateToken');

module.exports = function (config = {}) {
  return generateToken().then((token) => {
    const headers = Object.assign({}, config.headers, { Authorization: `Bearer ${token}` });
    return axios.create(Object.assign({}, config, { headers }))
  });
};
