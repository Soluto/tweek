/* global describe, before, beforeEach, after, afterEach, it, browser */

import { expect } from 'chai';
import Key from '../../utils/Key';
import Alert from '../../utils/Alert';
import { dataComp, attributeSelector } from '../../utils/selector-utils';
import { login } from '../../utils/auth-utils';

const timeout = 5000;
const addAliasButton = dataComp('add-alias');
const toggleButton = dataComp('aliases-toggle');

describe('key aliases', () => {
  const originalKeyPath = 'behavior_tests/key_aliases/regular_key';
  const aliasKeyPath = 'behavior_tests/key_aliases/alias_key';
  const aliasToAliasKeyPath = 'behavior_tests/key_aliases/alias_to_alias';
  const newAliasKeyPath = 'behavior_tests/key_aliases/new_alias';

  before(login);

  const waitForAlias = alias =>
    browser.waitForVisible(`${dataComp('aliases')} ${attributeSelector('data-dependency', alias)}`);

  it('add alias and navigate should redirect to original key and show aliases', () => {
    Key.open(originalKeyPath);

    browser.clickWhenVisible(addAliasButton, timeout);
    Alert.waitFor('ok');
    Key.setName(newAliasKeyPath);
    Alert.ok();

    browser.clickWhenVisible(toggleButton, timeout);

    waitForAlias(newAliasKeyPath);
    Key.navigate(newAliasKeyPath);

    browser.waitUntil(() => Key.isCurrent(originalKeyPath), timeout);

    browser.clickWhenVisible(toggleButton, timeout);

    waitForAlias(newAliasKeyPath);
    waitForAlias(aliasKeyPath);
    waitForAlias(aliasToAliasKeyPath);
  });
});
