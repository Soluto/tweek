/* global describe, before, after, it, browser */

import KeysAsserts from '../KeysAsserts';
import KeysPageObject from '../KeysPageObject';
import moment from "moment";
import { selectors } from '../selectors';


describe('keys list and filter', () => {
  const keysPageObject = new KeysPageObject(browser);
  const keyAsserts = new KeysAsserts(keysPageObject, browser);
  const testFolder = `${moment(new Date()).format('DD-MM-YYYY-HH-mm-ss')}`;

  before(() => {
    browser.url(KeysPageObject.BASE_URL);
    keysPageObject.addEmptyKey(`${KeysPageObject.TEST_KEYS_FOLDER}/@keyList/${testFolder}/greenApple`);
    keysPageObject.addEmptyKey(`${KeysPageObject.TEST_KEYS_FOLDER}/@keyList/${testFolder}/redApple`);
    keysPageObject.addEmptyKey(`${KeysPageObject.TEST_KEYS_FOLDER}/@keyList/${testFolder}/banana`);
  });

  it("should be able to navigate to key by folders", () => {
    keysPageObject.goToKeysList();

    keysPageObject.clickOnFolder(KeysPageObject.TEST_KEYS_FOLDER);
    keysPageObject.clickOnFolder(`${KeysPageObject.TEST_KEYS_FOLDER}/@keyList/`);
    keysPageObject.clickOnFolder(`${KeysPageObject.TEST_KEYS_FOLDER}/@keyList/${testFolder}`);

    keysPageObject.clickOnKeyLink(`${KeysPageObject.TEST_KEYS_FOLDER}/@keyList/${testFolder}/greenApple`);

    keyAsserts.assertIsInKeyPage(`${KeysPageObject.TEST_KEYS_FOLDER}/@keyList/${testFolder}/greenApple`);
  });

  it("should display matching keys when filtering", () => {
    browser.url(KeysPageObject.BASE_URL);

    keysPageObject.enterFilterInKeysList("Apple");

    assert.equal(true, browser.isVisible(selectors.keyLink(`${KeysPageObject.TEST_KEYS_FOLDER}/@keyList/${testFolder}/greenApple`)));
    assert.equal(true, browser.isVisible(selectors.keyLink(`${KeysPageObject.TEST_KEYS_FOLDER}/@keyList/${testFolder}/redApple`)));
    assert.equal(false, browser.isVisible(selectors.keyLink(`${KeysPageObject.TEST_KEYS_FOLDER}/@keyList/${testFolder}/banana`)));
  });
});