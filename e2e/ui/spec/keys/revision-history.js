/* global describe, before, after, it, browser */

import { expect } from 'chai';
import * as KeyUtils from '../../utils/key-utils';

describe('revision history', () => {
  const keyName = '@behavior_tests/@revision_history/key';
  const revisionHistorySelector = '[data-comp= revision-history]';
  const valueSelector = '[data-comp= ConstEditor] input';

  function changeValue(count) {
    const currentCommitSelector = `${revisionHistorySelector} option:nth-of-type(1)`;
    let prevCommit = browser.getValue(currentCommitSelector);
    let history = [{ commit: prevCommit, value: browser.getValue(valueSelector) }];
    for (let i = 0; i < count; i++) {
      const value = `value ${i}`;
      browser.setValue(valueSelector, value);
      KeyUtils.commitChanges();

      let commit = undefined;
      browser.waitUntil(() => {
        commit = browser.getValue(currentCommitSelector);
        return prevCommit !== commit;
      }, 1000);
      prevCommit = commit;
      history = [{ commit, value }, ...history];
    }
    return history;
  }

  it('should display revision history', () => {
    KeyUtils.goToKey(keyName);
    browser.waitForVisible(revisionHistorySelector, 1000);

    const changeCount = 4;
    const history = changeValue(changeCount);

    const values = browser.getValue(`${revisionHistorySelector} option`);
    expect(values).to.have.lengthOf(history.length);

    const revisionHistorySelect = browser.element(revisionHistorySelector);
    revisionHistorySelect.selectByValue(history[2].commit);

    browser.waitForVisible(valueSelector, 1000);
    const keyValue = browser.getValue(valueSelector);
    expect(keyValue).to.equal(history[2].value);
  });
});
