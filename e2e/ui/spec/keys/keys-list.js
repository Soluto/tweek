/* global describe, before, after, it, browser */

import { expect } from 'chai';
import Key from '../../utils/Key';
import { attributeSelector, dataComp } from '../../utils/selector-utils';

describe('keys list and filter', () => {
  const keysListTestFolder = 'behavior_tests/keys_list';

  const greenAppleKeyFullPath = `${keysListTestFolder}/green_apple`;
  const redAppleKeyFullPath = `${keysListTestFolder}/red_apple`;
  const bananaKeyFullPath = `${keysListTestFolder}/banana`;

  const keyLink = keyName =>
    `${dataComp('key-link')} ${attributeSelector('href', `/keys/${keyName}`)}`;

  before(() => {
    Key.open();
  });

  it('should be able to navigate to key by folders', () => {
    Key.navigate(greenAppleKeyFullPath);

    expect(Key.isCurrent(greenAppleKeyFullPath)).to.be.true;
  });

  it('should display matching keys when filtering', () => {
    Key.search('apple');

    browser.waitForVisible(keyLink(greenAppleKeyFullPath), 2000);
    browser.waitForVisible(keyLink(redAppleKeyFullPath), 2000);
    browser.waitForVisible(keyLink(bananaKeyFullPath), 2000, true);
  });
});
