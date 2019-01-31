import uuid from 'uuid/v4';
import { editorUrl } from '../../utils/constants';
import { credentials, login } from '../../utils/auth-utils';
import { refresh } from '../../utils/location-utils';
import EditKey from '../../pages/Keys/EditKey';

const tagsTestKeyFullPath = 'behavior_tests/tags';
const NUMBER_OF_TAGS_TO_ADD = 1;

fixture`Add Tags`.page`${editorUrl}/keys`.httpAuth(credentials).beforeEach(login);

test('should save the tag as a suggestion on submitting it without saving the key', async (t) => {
  const editKey = await EditKey.open(tagsTestKeyFullPath);

  const tagsToAdd = [];
  for (let tagsIndex = 0; tagsIndex < NUMBER_OF_TAGS_TO_ADD; tagsIndex++) {
    const tag = uuid();
    tagsToAdd.push(tag);
    await editKey.tagsInput.add(tag);
  }

  await t.setNativeDialogHandler(() => true);

  await refresh();

  await t.expect(editKey.tagsInput.input.visible).ok();

  for (const tag of tagsToAdd) {
    const partialTag = tag.slice(0, tag.length - 1);
    await t
      .typeText(editKey.tagsInput.input, partialTag, { replace: true })
      .expect(editKey.tagSuggestion.count)
      .eql(1);
  }
});
