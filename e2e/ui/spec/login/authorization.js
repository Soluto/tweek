import { editorUrl } from '../../utils/constants';
import { login } from '../../utils/auth-utils';
import { getLocation } from '../../utils/location-utils';
import { Selector } from 'testcafe';
import { dataComp } from '../../utils/selector-utils';

const errorMessage = Selector(dataComp('error-message'));

fixture`Authorization error`.page`${editorUrl}/login`;

test('no permissions to access tweek', async (t) => {
  await login(t, { username: 'user2', password: 'pwd' });

  await t
    .expect(getLocation())
    .notEql(`${editorUrl}/login`)
    .expect(errorMessage.visible)
    .ok();
});
