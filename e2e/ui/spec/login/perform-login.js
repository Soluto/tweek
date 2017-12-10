/* global describe, before, after, it, browser */

import { expect } from 'chai';
import { dataComp, dataField, attributeSelector } from '../../utils/selector-utils';

const timeout = 5000;
const tweekLogo = dataComp('tweek-logo');
const digestAuthLink = dataComp('Username and password (Digest Authentication)');

describe('perform login', () => {
  before(() => {
    browser.url('/login');
  });

  it('should show tweek logo', () => {
    browser.waitForVisible(tweekLogo, timeout);
  });

  it('should show button for each auth provider', () => {
    browser.waitForVisible(digestAuthLink, timeout);
  });
});
