/* global browser */
const nconf = require('nconf');

export const loginAndGoto = url => {
  const editorUrlWithCredentials = nconf
    .get('EDITOR_URL')
    .replace('http://', `http://${nconf.get('AUTH_DIGEST_CREDENTIALS')}@`);
  browser.url(`${editorUrlWithCredentials}${nconf.get('AUTH_DIGEST_URL')}`);
  browser.url(url);
};
