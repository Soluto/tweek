/* global describe, before, after, it, browser */

import { expect } from 'chai';
import { dataComp, dataField } from '../../utils/selector-utils';
import Key from '../../utils/Key';
import Rule from '../../utils/Rule';

const timeout = 5000;

const keyToAddFullPath = 'behavior_tests/add_key/add_key_test';
const keyPathSuggestions = `${dataComp('new-key-name')} ${dataField('suggestions')}`;

describe('add key', () => {
  it('should succeed adding key', () => {
    Key.add();

    expect(Key.isCurrent(Key.BLANK_KEY_NAME)).to.be.true;
    expect(browser.isExisting(keyPathSuggestions)).to.be.false;
    expect(Rule.count()).to.equal(0);

    Key.setName(keyToAddFullPath).setValueType('string').setKeyFormat('jpad');
    Key.addDetails();

    expect(Key.hasChanges).to.be.true;

    Key.clickSave();

    expect(Key.isSaving).to.be.true;

    browser.waitUntil(() => Key.isCurrent(keyToAddFullPath), timeout);
    browser.waitForVisible(dataComp('archive-key'), timeout);

    expect(Key.displayName).to.equal(keyToAddFullPath);
    expect(Key.hasChanges).to.be.false;
  });
});
