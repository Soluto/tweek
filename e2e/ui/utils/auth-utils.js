/* global browser */
const nconf = require('nconf');
const crypto = require('crypto');
const fs = require('fs');
const AUTH_BASIC_URL = '/auth/basic';

const key = fs.readFileSync(nconf.get('GIT_PRIVATE_KEY_PATH')).toString('base64');
const adminAppId = nconf.get('ADMIN_APP_ID');
const adminAppSecret = crypto
  .createHash('md5')
  .update(key)
  .digest('base64');

const editorUrlWithCredentials = nconf
  .get('GATEWAY_URL')
  .replace('http://', `http://${adminAppId}:${encodeURIComponent(adminAppSecret)}@`);

const redirectUrl = nconf.get('EDITOR_URL');

export const login = () => {
  browser.url(
    `${editorUrlWithCredentials}${AUTH_BASIC_URL}?redirect_url=${redirectUrl}/auth/basic&state={"redirect":{"pathname":"/","search":"","hash":""}}`,
  );
};
