/* global describe, before, after, it, browser */

import Key from '../../utils/Key';
import Chance from 'chance';
import { dataComp } from '../../utils/selector-utils';

const chance = new Chance();

const timeout = 5000;

const keyTags = dataComp('key-tags');
const tagsInput = `${keyTags} .tag-input input`;
const suggestion = `${keyTags} .tags-suggestion ul li`;

describe('add tags', () => {
  const NUMBER_OF_TAGS_TO_ADD = 1;

  const tagsTestKeyFullPath = 'behavior_tests/tags';

  before(() => {
    Key.open(tagsTestKeyFullPath);
  });

  function addTag(tagName) {
    browser.setValue(tagsInput, `${tagName}\n`);
  }

  function isTagExists(tag) {
    const partialTag = tag.slice(0, tag.length - 1);
    browser.setValue(tagsInput, partialTag);

    browser.waitForVisible(suggestion, timeout);
    const tagsSuggestions = browser.elements(suggestion);
    return tagsSuggestions.value.length === 1;
  }

  it('should save the tag as a suggestion on submitting it without saving the key', () => {
    // Arrange
    const tagsToAdd = [];
    for (let tagsIndex = 0; tagsIndex < NUMBER_OF_TAGS_TO_ADD; tagsIndex++)
      tagsToAdd.push(chance.guid());

    // Act
    tagsToAdd.forEach(x => addTag(x));
    browser.refresh();
    browser.alertAccept();

    browser.waitForVisible(tagsInput, timeout);

    // Assert
    tagsToAdd.forEach(x => browser.waitUntil(() => isTagExists(x), timeout));
  });
});
