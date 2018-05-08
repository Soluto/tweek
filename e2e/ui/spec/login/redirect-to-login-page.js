/* global describe, before, after, it, browser */

import { expect } from 'chai';
import url from 'url';
import { dataComp, dataField, attributeSelector } from '../../utils/selector-utils';

const timeout = 5000;
const tweekLogo = dataComp('tweek-logo');
const basicAuthLink = dataComp('Basic Auth Login');

describe('redirect to login page', () => {
  it('should navigate to login page', () => {
    browser.url('/');
    const newPath = url.parse(browser.getUrl()).pathname;
    expect(newPath).to.equal('/login');
    browser.waitForVisible(tweekLogo, timeout);
    browser.waitForVisible(basicAuthLink, timeout);
  });
});
