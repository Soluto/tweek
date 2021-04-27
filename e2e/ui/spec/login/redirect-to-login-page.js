import { Selector } from 'testcafe';
import { editorUrl } from '../../utils/constants';
import { dataComp } from '../../utils/selector-utils';
import { getLocation } from '../../utils/location-utils';

const tweekLogo = Selector(dataComp('tweek-logo'));
const basicAuthLink = Selector(dataComp('@@tweek-basic-auth'));

fixture`Login Page`.page`${editorUrl}`;

test('should navigate to login page', async (t) => {
  await t
    .expect(getLocation())
    .eql(`${editorUrl}/login`)
    .expect(tweekLogo.visible)
    .ok()
    .expect(basicAuthLink.visible)
    .ok();
});
