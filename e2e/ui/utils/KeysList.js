import { attributeSelector, dataComp } from './selector-utils';
import * as R from 'ramda';

const timeout = 5000;

const searchKeyInput = dataComp('search-key-input');
const directoryTreeView = dataComp('directory-tree-view');
const treeItem = (attribute, value) =>
  `${directoryTreeView} ${attributeSelector(attribute, value)}`;

const extractFolders = R.pipe(
  R.split('/'),
  R.dropLast(1),
  R.mapAccum((acc, value) => R.repeat(acc ? `${acc}/${value}` : value, 2), null),
  R.prop(1),
);

class KeysList {
  navigate(keyName) {
    const keyFolders = extractFolders(keyName);

    keyFolders.forEach(folder =>
      browser.clickIfVisible(
        treeItem('data-folder-name', folder) + '[data-is-collapsed=true]',
        timeout,
      ),
    );

    const keyLinkSelector = treeItem('href', `/keys/${keyName}`);
    browser.clickWhenVisible(keyLinkSelector, timeout);

    return this;
  }

  assertInList(keyName, reverse) {
    const keyFolders = extractFolders(keyName);

    for (const folder of keyFolders) {
      browser.clickIfVisible(
        treeItem('data-folder-name', folder + '[data-is-collapsed=true]'),
        1000,
      );
    }

    const keyLinkSelector = treeItem('href', `/keys/${keyName}`);
    browser.waitForVisible(keyLinkSelector, 2000, reverse);
  }

  search(filter) {
    browser.waitForVisible(searchKeyInput, timeout);
    browser.setValue(searchKeyInput, filter);
    return this;
  }
}

export default new KeysList();
