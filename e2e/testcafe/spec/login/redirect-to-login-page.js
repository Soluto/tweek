import { Selector } from 'testcafe';
import { editorUrl } from '../../utils/constants';
import { dataComp } from '../../utils/selector-utils';
import { getLocation } from '../../utils/location-utils';

const tweekLogo = Selector(dataComp('tweek-logo'));
const basicAuthLink = Selector(dataComp('Basic Auth Login'));

fixture`Login Page`.page`${editorUrl}`;

test('should navigate to login page', async (t) => {
  await t.expect(getLocation()).eql(`${editorUrl}/login`);

  await t.expect(tweekLogo.visible).ok();
  await t.expect(basicAuthLink.visible).ok();
});
