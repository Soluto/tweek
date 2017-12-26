/* global describe, before, after, beforeEach, it, browser */

import Key from '../../utils/Key';
import KeysList from '../../utils/KeysList';
import Rule from '../../utils/Rule';
import { login } from '../../utils/auth-utils';

const timeout = 1000;

describe('navigating from key with changes', () => {
  const keyName = 'behavior_tests/routing';

  before(() => login());

  beforeEach(() =>
    Key.add()
      .setValueType('boolean')
      .setKeyFormat('jpad')
      .setName('routing_test')
      .continueToDetails(),
  );

  it('should show confirm message if navigating to another key', () => {
    Rule.add();
    browser.waitUntil(() => Key.hasChanges, timeout);

    KeysList.navigate(keyName);

    browser.waitForAlert(timeout, 'should show confirm message');
    browser.alertAccept();
  });

  it('should show confirm message if refreshing', () => {
    Rule.add();
    browser.waitUntil(() => Key.hasChanges, timeout);

    browser.refresh();

    browser.waitForAlert(timeout, 'should show confirm message');
    browser.alertAccept();
  });
});
