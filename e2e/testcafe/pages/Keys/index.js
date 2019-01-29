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

  async getKeyLink(keyName) {
    const keyFolders = extractFolders(keyName);

    for (const folder of keyFolders) {
      const collapesDirectory = this.directoryTreeView
        .find(attributeSelector('data-folder-name', folder))
        .withAttribute('data-is-collapsed', 'true');

      if (await collapesDirectory.visible) {
        await t.click(collapesDirectory);
      }
    }

    const link = this.directoryTreeView.find(attributeSelector('href', `/keys/${keyName}`));

    await t.expect(link.visible).ok();

    return link;
  }

  async openKey(keyName) {
    const link = await this.getKeyLink(keyName);
    const editKey = new EditKey();

    await t
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
