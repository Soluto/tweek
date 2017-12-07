/* global describe, before, after, it, browser */

import { expect } from 'chai';
import { dataComp, dataField, attributeSelector } from '../../utils/selector-utils';

const timeout = 5000;
const tweekLogo = dataComp('tweek-logo');

describe('perform login', () => {
  before(() => {
    browser.url('/login');
    browser.windowHandleSize({ width: 2000, height: 1000 });
  });

  it('should show tweek logo', () => {
    browser.waitForVisible(tweekLogo, timeout);
  });

  it('should show button for each auth provider', () => {});
});
