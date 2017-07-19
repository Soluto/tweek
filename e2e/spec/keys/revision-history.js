/* global describe, before, after, it, browser */

import { expect } from 'chai';
import KeysPageObject from '../../utils/KeysPageObject';

describe('revision history', () => {
  const keysPageObject = new KeysPageObject(browser);
  const keyName = '@behavior_tests/@revision_history/key';
  const revisionHistorySelector = '[data-comp= revision-history]';
  const valueSelector = "[data-comp= ConstEditor] input";

  function changeValue(count) {
    const currentCommitSelector = `${revisionHistorySelector} option:nth-of-type(1)`;
    let prevCommit = browser.getValue(currentCommitSelector);
    for (let i = 0; i<count; i++) {
      browser.setValue(valueSelector, `value ${i}`);
      keysPageObject.commitChanges();
      browser.waitUntil(() => {
        const currentCommit = browser.getValue(currentCommitSelector);
        return prevCommit !== currentCommit
      }, 1000);
    }
  }

  it('should display revision history', () => {
    keysPageObject.goToKey(keyName);
    browser.waitForVisible(revisionHistorySelector, 1000);

    changeValue(4);

    const values = browser.getValue(`${revisionHistorySelector} option`);
    // @tweek/editor/history/max_count === 3
    expect(values.length).to.equal(3);

    const revisionHistorySelect = browser.element(revisionHistorySelector);
    revisionHistorySelect.selectByIndex(2);

    browser.waitForVisible(valueSelector, 1000);
    const keyValue = browser.getValue(valueSelector);
    expect(keyValue).to.equal('value 1');
  })
});
