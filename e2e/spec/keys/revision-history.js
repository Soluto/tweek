/* global describe, before, after, it, browser */

import { expect } from 'chai';
import KeysPage from '../../utils/KeysPage';

describe('revision history', () => {
  const keyName = '@behavior_tests/@revision_history/key';
  const revisionHistorySelector = '[data-comp= revision-history]';
  const valueSelector = '[data-comp= ConstEditor] input';

  function changeValue(count) {
    const currentCommitSelector = `${revisionHistorySelector} option:nth-of-type(1)`;
    let prevCommit = browser.getValue(currentCommitSelector);
    for (let i = 0; i < count; i++) {
      browser.setValue(valueSelector, `value ${i}`);
      KeysPage.commitChanges();

      let currentCommit = undefined;
      browser.waitUntil(() => {
        currentCommit = browser.getValue(currentCommitSelector);
        return prevCommit !== currentCommit;
      }, 1000);
      prevCommit = currentCommit;
    }
  }

  it('should display revision history', () => {
    KeysPage.goToKey(keyName);
    browser.waitForVisible(revisionHistorySelector, 1000);

    const changeCount = 4;
    changeValue(changeCount);

    const values = browser.getValue(`${revisionHistorySelector} option`);
    expect(values.length).to.equal(changeCount + 1);

    const revisionHistorySelect = browser.element(revisionHistorySelector);
    revisionHistorySelect.selectByIndex(2);

    browser.waitForVisible(valueSelector, 1000);
    const keyValue = browser.getValue(valueSelector);
    expect(keyValue).to.equal('value 1');
  });
});
