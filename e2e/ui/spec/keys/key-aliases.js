/* global describe, before, beforeEach, after, afterEach, it, browser */

import { expect } from 'chai';
import Key from '../../utils/Key';
import KeysList from '../../utils/KeysList';
import Alert from '../../utils/Alert';
import { dataComp, attributeSelector } from '../../utils/selector-utils';
import { login } from '../../utils/auth-utils';
import authoringClient from '../../clients/authoring-client';

const timeout = 5000;
const addAliasButton = dataComp('add-alias');
const aliasContainer = alias =>
  `${dataComp('aliases')} ${attributeSelector('data-dependency', alias)}`;
const deleteAliasButton = alias => `${aliasContainer(alias)} ${dataComp('delete-alias')}`;

describe('key aliases', () => {
  const originalKeyPath = 'behavior_tests/key_aliases/regular_key';
  const aliasKeyPath = 'behavior_tests/key_aliases/alias_key';
  const aliasToAliasKeyPath = 'behavior_tests/key_aliases/alias_to_alias';
  const newAliasKeyPath = 'behavior_tests/key_aliases/new_alias';
  const deleteAliasKeyPath = 'behavior_tests/key_aliases/delete_alias';

  before(login);

  it('should add alias', () => {
    Key.open(originalKeyPath);

    browser.clickWhenVisible(addAliasButton, timeout);
    Alert.waitFor('ok');
    Key.setName(newAliasKeyPath);
    Alert.ok();

    Key.toggle('aliases');
    browser.waitForVisible(aliasContainer(newAliasKeyPath));
    KeysList.assertInList(newAliasKeyPath);
  });

  it('should delete alias', () => {
    Key.open(deleteAliasKeyPath);
    Key.toggle('aliases');

    browser.clickWhenVisible(deleteAliasButton(deleteAliasKeyPath));
    Alert.ok();
    browser.waitForVisible(aliasContainer(deleteAliasKeyPath), true);
    KeysList.assertInList(deleteAliasKeyPath, true);
    authoringClient.waitForKeyToBeDeleted(deleteAliasKeyPath);
  });

  it('should redirect to key when navigating to alias', () => {
    KeysList.navigate(aliasKeyPath);

    browser.waitUntil(() => Key.isCurrent(originalKeyPath), timeout);

    Key.toggle('aliases');

    browser.waitForVisible(aliasContainer(aliasKeyPath));
    browser.waitForVisible(aliasContainer(aliasToAliasKeyPath));
  });
});
