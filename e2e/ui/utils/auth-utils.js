import { dataComp } from './selector-utils';
import { Selector } from 'testcafe';
import { getLocation } from './location-utils';
import { editorUrl } from './constants';

export const credentials = {
  username: 'admin-app',
  password: '8v/iUG0vTH4BtVgkSn3Tng==',
};

const mockAuth = Selector(dataComp('mock'));
const username = 'user';
const password = 'pwd';
const usernameComp = Selector('#Username');
const passwordComp = Selector('#Password');
const loginComp = Selector('[value = "login"]');
const confirmComp = Selector('[value = "yes"]');
const rememberConsent = Selector('#RememberConsent');

export const login = async (t) => {
  await t
    .expect(getLocation())
    .eql(`${editorUrl}/login`)
    .expect(mockAuth.visible)
    .ok()
    .click(mockAuth)
    .expect(usernameComp.visible)
    .ok()
    .typeText(usernameComp, username, { replace: true })
    .typeText(passwordComp, password, { replace: true })
    .click(loginComp)
    .expect(rememberConsent.visible)
    .ok()
    .click(rememberConsent)
    .click(confirmComp)
    .expect(getLocation())
    .match(new RegExp(`^${editorUrl}(?!\/login)`));
};
