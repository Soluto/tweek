import { ClientFunction, t } from 'testcafe';
import { editorUrl } from './constants';

export const getLocation = ClientFunction(() => document.location.href);

export const refresh = ClientFunction(() => location.reload(true));

export const navigateToKey = async (keyPath) => {
  await t
    .navigateTo(`/keys/${keyPath}`)
    .expect(getLocation())
    .eql(`${editorUrl}/keys/${keyPath}`);
};
