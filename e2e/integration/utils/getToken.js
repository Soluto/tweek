const jwt = require('jsonwebtoken');
const fs = require('fs');
const { promisify } = require('util');
const jwtSign = promisify(jwt.sign);

const jwtOptions = {
  algorithm: 'RS256',
  issuer: 'tweek',
  expiresIn: '15m',
};
let token = {};

module.exports = async function(pkey) {
  return await jwtSign({}, pkey, jwtOptions);
};
