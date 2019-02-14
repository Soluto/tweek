import { editorUrl } from '../../utils/constants';
import { getLocation } from '../../utils/location-utils';
import { credentials, login } from '../../utils/auth-utils';
import EditKey from '../../pages/Keys/EditKey';

const keyName = 'behavior_tests/revision_history';

fixture`Revision History`.page`${editorUrl}/keys`.httpAuth(credentials).beforeEach(login);

test('should display revision history', async (t) => {
  const count = 4;
  const editPage = await EditKey.open(keyName);

  const currentCommit = editPage.revisionHistory.revision.nth(0);
  let prevCommit = await editPage.revisionHistory.currentCommit();
  const initialRevisionCount = await editPage.revisionHistory.revision.count;

  const history = [];

  for (let i = 0; i < count; i++) {
    const value = `value ${i}`;
    await t.typeText(editPage.jpad.defaultValue.input, value, { replace: true });
    await editPage.commitChanges();
    await t.expect(currentCommit.value).notEql(prevCommit);
    prevCommit = await currentCommit.value;
    history.unshift({ value, commit: prevCommit });
  }

  await t
    .expect(editPage.revisionHistory.revision.count)
    .eql(initialRevisionCount + count)
    .click(editPage.revisionHistory.container)
    .click(editPage.revisionHistory.revision.nth(2))
    .expect(getLocation())
    .eql(`${editorUrl}/keys/${keyName}?revision=${history[2].commit}`)
    .expect(editPage.jpad.defaultValue.input.value)
    .eql(history[2].value);
});
