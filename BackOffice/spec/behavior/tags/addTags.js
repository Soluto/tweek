/* global describe, before, after it, browser */

import KeysPageObject from '../KeysPageObject';
import assert from 'assert';
import { selectors } from '../selectors';
import Chance from 'chance';

describe('add tags', () => {
  const keysPageObject = new KeysPageObject(browser);

  const tagsTestKeyName = keysPageObject.generateKeyName('tagsTest');
  const testFolder = '@tests';
  const behaviorTestFolder = `${testFolder}/behavior`;
  const tagsTestKeyFullPath = `${behaviorTestFolder}/${tagsTestKeyName}`;

  const chance = new Chance();

  const enterKeyCode = '\uE007';

  // beforeEach(() => {
  //   keysPageObject.addEmptyKey(tagsTestKeyFullPath);
  //   browser.windowHandleMaximize();
  // });

  // afterEach(() => {
  //   keysPageObject.deleteKeyIfExists(tagsTestKeyFullPath);
  // });

  function addTag(tagName) {
    browser.setValue(selectors.TAGS_INPUT, tagName);
    browser.keys(enterKeyCode);
  }

  function getOpenedKeyTags() {
    const tagsElements = browser.elements(selectors.TAG);

    return tagsElements.value
            .map(x => browser.elementIdText(x.ELEMENT))
            .map(x => x.value)
            .filter(x => !!x && x !== '×')
            .map(x => x.slice(0, x.length - 2));
  }

  function assertTagSuggestionExists(partialTagName) {
    browser.setValue(selectors.TAGS_INPUT, partialTagName);

    const tagsSuggestions = browser.elements(selectors.TAGS_SUGGESTION);
    assert.equal(tagsSuggestions.value.length, 1);
  }

  // it('should succeed add tags to key', () => {
  //   keysPageObject.goToKey(tagsTestKeyFullPath);
    
  //   const guid1 = chance.guid();
  //   const guid2 = chance.guid();
  //   addTag(guid1);
  //   addTag(guid2);

  //   browser.click(selectors.SAVE_CHANGES_BUTTON);
  //   browser.waitUntil(() => !keysPageObject.isSaving(), 10000);

  //   browser.refresh();
  //   keysPageObject.waitForKeyToLoad();

  //   const tags = getOpenedKeyTags();

  //   assert.deepEqual([guid1, guid2], tags);
  // });

  // it('should save the tag as a suggestion on submiting it without saving the key', () => {
  //   keysPageObject.goToKey(tagsTestKeyFullPath);

  //   const guid1 = chance.guid();
  //   const guid2 = chance.guid();
  //   addTag(guid1);
  //   addTag(guid2);

  //   browser.refresh();
  //   keysPageObject.waitForKeyToLoad();

  //   const partialGuid1 = guid1.slice(0, guid1.length - 1);
  //   assertTagSuggestionExists(partialGuid1);

  //   const partialGuid2 = guid1.slice(0, guid2.length - 1);
  //   assertTagSuggestionExists(partialGuid2);
  // });

  it('should do something TEST',()=>{
    keysPageObject.goToKey("@tests/behavior/addKeyTest-05-12-2016-11-52-29");
  });
});
