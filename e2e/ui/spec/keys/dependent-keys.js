/* global describe, before, beforeEach, after, afterEach, it, browser */

import { saveChangesButton, defaultTimeout } from '../../utils/key-utils';
import Key from '../../utils/Key';
import Rule from '../../utils/Rule';
import { dataComp } from '../../utils/selector-utils';
import globalSelectors from '../../selectors/globalSelectors';
import { expect } from 'chai';

describe('dependent keys', () => {
  before(() => {
    browser.windowHandleMaximize();
  });

  it('should save when no circular dependencies', () => {
    Key.open('behavior_tests/dependent_keys/pass/depends_on');
    Rule.add().withCondition('keys.behavior_tests/dependent_keys/pass/used_by', 'value');
    Key.current.commitChanges();
  });

  it('should not save circular dependencies', () => {
    Key.open('behavior_tests/dependent_keys/fail/third');
    Rule.add().withCondition('keys.behavior_tests/dependent_keys/fail/first', 'value');

    browser.click(saveChangesButton);

    browser.waitForVisible(globalSelectors.ERROR_NOTIFICATION_TITLE, defaultTimeout);
    const errorText = browser.getText(globalSelectors.ERROR_NOTIFICATION_TITLE);
    expect(errorText).to.equal('Failed to save key');
  });

  it('should display dependency relations between keys', () => {
    const dependsOn = 'behavior_tests/dependent_keys/display/depends_on';
    const usedBy = 'behavior_tests/dependent_keys/display/used_by';

    // Verify depends on
    Key.open(dependsOn);
    browser.clickWhenVisible(dataComp('depends-on-toggle'), defaultTimeout);
    browser.waitForVisible(`${dataComp('depends-on')} a[href="/keys/${usedBy}"]`);

    // Verify used by
    Key.open(usedBy);
    browser.clickWhenVisible(dataComp('used-by-toggle'), defaultTimeout);
    browser.waitForVisible(`${dataComp('used-by')} a[href="/keys/${dependsOn}"]`);
  });
});
