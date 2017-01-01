/* global describe, before, after it, browser */

import KeysPageObject from '../KeysPageObject';
import assert from 'assert';
import { selectors } from '../selectors';
import Chance from 'chance';

describe('add tags', () => {
    const keysPageObject = new KeysPageObject(browser);

    const tagsTestKeyName = 'tagsTest';
    const testFolder = KeysPageObject.TEST_KEYS_FOLDER;
    const tagsTestFolder = '@tags';
    const tagsTestKeyFullPath = `${testFolder}/${tagsTestFolder}/${tagsTestKeyName}`;

    const chance = new Chance();

    const enterKeyCode = '\uE007';

    before(() => {
        try {
            keysPageObject.goToKey(tagsTestKeyFullPath);
        }
        catch (exp) {
            keysPageObject.addEmptyKey(tagsTestKeyFullPath);
        }

        browser.windowHandleMaximize();
    });

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
        keysPageObject.waitForVisible(selectors.TAGS_INPUT, 2000, 'cannot find tags input');

        browser.setValue(selectors.TAGS_INPUT, partialTagName);

        keysPageObject.waitForVisible(selectors.TAGS_SUGGESTION, 2000, 'cannot find tags suggestion list');

        const tagsSuggestions = browser.elements(selectors.TAGS_SUGGESTION);
        assert.equal(tagsSuggestions.value.length, 1);
    }

    it('should save the tag as a suggestion on submiting it without saving the key', () => {
        // Arrange
        keysPageObject.goToKey(tagsTestKeyFullPath);

        const guid1 = chance.guid();
        const guid2 = chance.guid();

        // Act
        addTag(guid1);
        addTag(guid2);

        keysPageObject.wait(40000);
        browser.refresh();

        // Assert
        const partialGuid1 = guid1.slice(0, guid1.length - 1);
        assertTagSuggestionExists(partialGuid1);

        const partialGuid2 = guid2.slice(0, guid2.length - 1);
        assertTagSuggestionExists(partialGuid2);
    });
});
