import { Selector, t } from 'testcafe';
import { dataComp, dataField } from '../../utils/selector-utils';
import JPad from './JPad';
import TagInput from './TypedInput/TagInput';
import ConstValue from './ConstValue';

class Expander {
  constructor(component) {
    this.container = Selector(dataComp(component));
    this.toggleButton = this.container.find(dataComp('expander-toggle'));
  }
}

class Dependencies extends Expander {
  constructor(type) {
    super(type);
    this.link = this.container.find('a');
  }

  linkTo(key) {
    return this.link.withAttribute('href', `/keys/${key}`);
  }
}

class Aliases extends Expander {
  constructor() {
    super('aliases');
  }
}

export default class EditKey {
  container = Selector(dataComp('key-edit-page'));

  saveChangesButton = this.container.find(dataComp('save-changes'));
  saveChangesButtonHasChanges = this.saveChangesButton.withAttribute(
    'data-state-has-changes',
    'true',
  );
  saveChangesButtonIsSaving = this.saveChangesButton.withAttribute('data-state-is-saving', 'true');

  archiveButton = this.container.find(dataComp('archive-key'));
  unarchiveButton = this.container.find(dataComp('unarchive-key'));
  deleteButton = this.container.find(dataComp('delete-key'));

  messageText = this.container.find(dataComp('key-message'));
  displayNameText = this.container.find(dataComp('display-name')).find(dataField('text'));

  tags = this.container.find(dataComp('key-tags'));
  tagsInput = new TagInput(this.tags);
  tagSuggestion = this.tags.find('.tags-suggestion ul li');

  dependsOn = new Dependencies('depends-on');
  usedBy = new Dependencies('used-by');
  aliases = new Aliases();

  jpad = new JPad();
  constValue = new ConstValue();

  static async open(keyName) {
    const editKey = new EditKey();

    await t
      .navigateTo(`/keys/${keyName}`)
      .expect(editKey.container.visible)
      .ok()
      .expect(editKey.saveChangesButtonIsSaving.exists)
      .notOk()
      .expect(editKey.saveChangesButtonHasChanges.exists)
      .notOk();

    return editKey;
  }

  async commitChanges(selector) {
    if (!selector) {
      selector = this.saveChangesButton;
      await t.expect(this.saveChangesButtonHasChanges.visible).ok('no changes to commit');
    }

    await t
      .click(selector)
      .expect(this.saveChangesButtonIsSaving.exists)
      .notOk('still saving')
      .expect(this.saveChangesButtonHasChanges.exists)
      .notOk('changes were not saved');
  }
}
