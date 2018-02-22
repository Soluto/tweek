const jwt = require('jsonwebtoken');
const fs = require('fs');
const { promisify } = require('util');
const jwtSign = promisify(jwt.sign);
const readFile = promisify(fs.readFile);

const jwtOptions = {
  algorithm: 'RS256',
  issuer: 'tweek',
  expiresIn: '15m',
};
const data = {
  name: 'tweek-test',
  email: 'test@tweek.com',
};

module.exports = async authKey => await jwtSign(data, authKey, jwtOptions);
