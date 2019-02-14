import { dataComp } from './selector-utils';
import { Selector } from 'testcafe';
import { getLocation } from './location-utils';
import { editorUrl } from './constants';

export const credentials = {
  username: 'admin-app',
  password: '8v/iUG0vTH4BtVgkSn3Tng==',
};

const oidcCredentials = process.env.AUTH_DIGEST_CREDENTIALS || '';
const [username, password] = oidcCredentials.split(':');

const mockAuth = Selector(dataComp('mock'));
const usernameComp = Selector('#Username');
const passwordComp = Selector('#Password');
const loginComp = Selector('[value = "login"]');
const confirmComp = Selector('[value = "yes"]');
const rememberConsent = Selector('#RememberConsent');

export const login = async (t) => {
  await t.expect(getLocation()).eql(`${editorUrl}/login`);

  if (oidcCredentials) {
    await t
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
      .click(confirmComp);
  } else {
    await t.click(dataComp('Basic Auth Login'));
  }

  await t.expect(getLocation()).match(new RegExp(`^${editorUrl}(?!\/login)`));
};
