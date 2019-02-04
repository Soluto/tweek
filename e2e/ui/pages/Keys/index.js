import { Selector, t } from 'testcafe';
import * as R from 'ramda';
import { attributeSelector, dataComp } from '../../utils/selector-utils';
import NewKey from './NewKey';
import EditKey from './EditKey';

export const BLANK_KEY_NAME = '_blank';

const extractFolders = R.pipe(
  R.split('/'),
  R.dropLast(1),
  R.mapAccum((acc, value) => R.repeat(acc ? `${acc}/${value}` : value, 2), null),
  R.prop(1),
);

export default class KeysPage {
  searchKeyInput = Selector(dataComp('search-key-input'));
  directoryTreeView = Selector(dataComp('directory-tree-view'));
  addNewKeyButton = Selector(dataComp('add-new-key'));

  page = Selector(dataComp('key-page'));

  link(keyName) {
    return this.directoryTreeView.find(attributeSelector('href', `/keys/${keyName}`));
  }

  async navigateToLink(keyName, force) {
    const keyFolders = extractFolders(keyName);

    for (const folder of keyFolders) {
      const directory = this.directoryTreeView.find(attributeSelector('data-folder-name', folder));
      if (force) {
        await t.expect(directory.exists).ok(`directory ${folder} is not visible`);
      }

      const collapsedDirectory = directory.withAttribute('data-is-collapsed', 'true');
      if (
        (await directory.exists) &&
        (await collapsedDirectory.exists) &&
        (await collapsedDirectory.visible)
      ) {
        await t.click(collapsedDirectory);
      }
    }

    return this.link(keyName);
  }

  async openKey(keyName) {
    const link = await this.navigateToLink(keyName, true);
    const editKey = new EditKey();

    await t
      .expect(link.visible)
      .ok(`expected link to ${keyName} to be visible`)
      .click(link)
      .expect(editKey.container.visible)
      .ok(`expected edit key page ${keyName} to be visible`);

    return editKey;
  }

  async addNewKey() {
    const newKey = new NewKey();

    await t
      .click(this.addNewKeyButton)
      .expect(newKey.container.visible)
      .ok('expected new key page to be visible');

    return newKey;
  }

  async search(filter) {
    await t
      .expect(this.searchKeyInput.visible)
      .ok('expected search key input to be visible')
      .typeText(this.searchKeyInput, filter, { replace: true });
  }
}
