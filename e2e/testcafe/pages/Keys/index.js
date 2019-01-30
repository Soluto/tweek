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

  async getKeyLink(keyName, force) {
    const keyFolders = extractFolders(keyName);

    for (const folder of keyFolders) {
      const directory = this.directoryTreeView.find(attributeSelector('data-folder-name', folder));
      if (force) {
        await t.expect(directory.exists).ok();
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

    return this.directoryTreeView.find(attributeSelector('href', `/keys/${keyName}`));
  }

  async openKey(keyName) {
    const link = await this.getKeyLink(keyName, true);
    const editKey = new EditKey();

    await t
      .expect(link.visible)
      .ok()
      .click(link)
      .expect(editKey.container.visible)
      .ok();

    return editKey;
  }

  async addNewKey() {
    const newKey = new NewKey();

    await t
      .click(this.addNewKeyButton)
      .expect(newKey.container.visible)
      .ok();

    return newKey;
  }

  async search(filter) {
    await t
      .expect(this.searchKeyInput.visible)
      .ok()
      .typeText(this.searchKeyInput, filter, { replace: true });
  }
}
