/* global browser */
import { dataComp, attributeSelector } from './selector-utils';
const nconf = require('nconf');

const timeout = 5000;

const editorUrl = nconf.get('GATEWAY_URL');

const mockAuth = dataComp('mock');
const username = 'user';
const password = 'pwd';
const usernameComp = '#Username';
const passwordComp = '#Password';
const loginComp = '[value = "login"]';
const confirmComp = '[value = "yes"]';
const rememberConsent = '#RememberConsent';

export const login = () => {
  browser.url(editorUrl);
  browser.clickWhenVisible(mockAuth, timeout);
  browser.waitForVisible(usernameComp, timeout);
  browser.setValue(usernameComp, username);
  browser.setValue(passwordComp, password);
  browser.clickWhenVisible(loginComp);
  browser.clickWhenVisible(rememberConsent, timeout);
  browser.clickWhenVisible(confirmComp, timeout);
  browser.pause(1000);
};
