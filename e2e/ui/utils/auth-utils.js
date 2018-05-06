/* global browser */
import { dataComp, attributeSelector } from './selector-utils';

const timeout = 5000;

const editorUrl = nconf.get('EDITOR_URL');

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
  browser.click(passwordComp, timeout);
  browser.keys(password);
  browser.click(loginComp);
  browser.clickWhenVisible(rememberConsent, timeout);
  browser.click(confirmComp, timeout);
  browser.pause(1000);
};
