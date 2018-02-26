const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const jwtSign = promisify(jwt.sign);

const jwtOptions = {
  algorithm: 'RS256',
  issuer: 'tweek-internal',
  expiresIn: '15m',
};
const data = {
  name: 'tweek-test',
  email: 'test@tweek.com',
};

module.exports = async authKey => await jwtSign(data, authKey, jwtOptions);
