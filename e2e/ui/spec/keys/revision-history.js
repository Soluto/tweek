/* global describe, before, after, it, browser */

import { expect } from 'chai';
import Key from '../../utils/Key';
import { dataComp, nthSelector } from '../../utils/selector-utils';

const revisionHistory = dataComp('revision-history');
const revision = `${revisionHistory} option`;

describe('revision history', () => {
  const keyName = 'behavior_tests/revision_history';

  function changeValue(count) {
    const currentCommit = nthSelector(1, revision);

    let prevCommit;
    const history = [];

    const noChangesAttribute = browser.getAttribute(revisionHistory, 'data-no-changes');
    if (noChangesAttribute !== 'true') {
      prevCommit = browser.getValue(currentCommit);
      let options = browser.getValue(revision);
      if (!Array.isArray(options)) {
        options = [options];
      }
      const commits = options.map(commit => ({ commit }));
      commits.reverse();
      history.push(...commits);
    }

    for (let i = 0; i < count; i++) {
      const value = `value ${i}`;
      Key.setDefaultValue(value).commitChanges();

      let commit = null;
      browser.waitUntil(() => {
        commit = browser.getValue(currentCommit);
        return prevCommit !== commit;
      }, 1000);
      prevCommit = commit;

      history.push({ commit, value });
    }
    history.reverse();
    return history;
  }

  it('should display revision history', () => {
    Key.open(keyName);
    browser.waitForVisible(revisionHistory, 1000);

    const changeCount = 4;
    const history = changeValue(changeCount);

    const values = browser.getValue(revision);
    expect(values).to.deep.equal(history.map(x => x.commit));

    const revisionHistorySelect = browser.element(revisionHistory);
    revisionHistorySelect.selectByValue(history[2].commit);

    expect(Key.defaultValue).to.equal(history[2].value);
  });
});
