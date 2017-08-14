/* global describe, before, beforeEach, after, afterEach, it, browser */

import * as KeyUtils from '../../utils/KeysPage';
import Rule from '../../utils/Rule';
import { dataComp } from '../../utils/selector-utils';
import globalSelectors from '../../selectors/globalSelectors';
import { expect } from 'chai';

describe('dependent keys', () => {
  before(() => {
    browser.windowHandleMaximize();
  });

  it('should save when no circular dependencies', () => {
    KeyUtils.goToKey('@behavior_tests/@dependent_keys/pass/depends_on');
    Rule.add().withCondition('keys.@behavior_tests/@dependent_keys/pass/used_by', 'value');
    KeyUtils.commitChanges();
  });

  it('should not save circular dependencies', () => {
    KeyUtils.goToKey('@behavior_tests/@dependent_keys/fail/third');
    Rule.add().withCondition('keys.@behavior_tests/@dependent_keys/fail/first', 'value');

    browser.click(dataComp('save-changes'));

    browser.waitForVisible(globalSelectors.ERROR_NOTIFICATION_TITLE, KeyUtils.defaultTimeout);
    const errorText = browser.getText(globalSelectors.ERROR_NOTIFICATION_TITLE);
    expect(errorText).to.equal('Failed to save key');
  });

  it('should display dependency relations between keys', () => {
    const dependsOn = '@behavior_tests/@dependent_keys/display/depends_on';
    const usedBy = '@behavior_tests/@dependent_keys/display/used_by';

    // Verify depends on
    KeyUtils.goToKey(dependsOn);
    browser.clickWhenVisible(dataComp('depends-on-toggle'), 5000);
    browser.waitForVisible(`${dataComp('depends-on')} a[href="/keys/${usedBy}"]`);

    // Verify used by
    KeyUtils.goToKey(usedBy);
    browser.clickWhenVisible(dataComp('used-by-toggle'), 5000);
    browser.waitForVisible(`${dataComp('used-by')} a[href="/keys/${dependsOn}"]`);
  });
});
