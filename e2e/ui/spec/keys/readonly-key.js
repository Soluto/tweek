/* global describe, before, after, it, browser */

import { expect } from 'chai';
import Key from '../../utils/Key';
import Rule from '../../utils/Rule';
import { dataComp } from '../../utils/selector-utils';

const keyMessage = dataComp('key-message');
const addRule = dataComp('add-rule');

describe('readonly key', () => {
  const testKeyFullPath = 'behavior_tests/read_only';

  it('should open the key as readonly', () => {
    Key.open(testKeyFullPath);

    browser.waitForVisible(keyMessage);

    const numberOfRules = Rule.count();

    browser.click(addRule);
    browser.click(addRule);

    expect(Rule.count()).to.equal(numberOfRules);
  });
});
