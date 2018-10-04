/* global browser */
import { dataComp, attributeSelector } from './selector-utils';
const nconf = require('nconf');

const timeout = 5000;

const editorUrl = nconf.get('GATEWAY_URL');

const mockAuth = dataComp('mock');
const username = 'User1';
const password = 'pwd';
const usernameComp = '#Username';
const passwordComp = '#Password';
const loginComp = '[value = "login"]';
const confirmComp = '[value = "yes"]';
const rememberConsent = '#RememberConsent';

export const login = () => {
  browser.url(editorUrl);
  browser.clickWhenVisible(mockAuth, timeout);
  browser.clickWhenVisible(usernameComp, timeout);
  browser.keys(username);
  browser.clickWhenVisible(passwordComp, timeout);
  browser.keys(password);
  browser.clickWhenVisible(loginComp);
  browser.clickWhenVisible(rememberConsent, timeout);
  browser.clickWhenVisible(confirmComp, timeout);
  browser.pause(1000);
};
