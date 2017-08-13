const jwt = require('jsonwebtoken');
const fs = require('fs');
const {promisify} = require('util');
const jwtSign = promisify(jwt.sign);
const readFile = promisify(fs.readFile);

const jwtOptions = {
  algorithm: 'RS256',
  issuer: 'tweek',
  expiresIn: '15m'
};
let token = {};

module.exports = async function(privateKeyPath){
   const authKey = await readFile(privateKeyPath);
   return await jwtSign({}, authKey, jwtOptions);
}
    