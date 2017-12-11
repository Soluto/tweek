/* global browser */
const nconf = require('nconf');

const AUTH_DIGEST_URL = 'auth/digest';

const editorUrlWithCredentials = nconf
  .get('EDITOR_URL')
  .replace('http://', `http://${nconf.get('AUTH_DIGEST_CREDENTIALS')}@`);

export const login = () => {
  browser.url(`${editorUrlWithCredentials}${AUTH_DIGEST_URL}`);
};
