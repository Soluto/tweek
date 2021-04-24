import { expect } from 'chai';
import { Selector } from 'testcafe';
import { credentials, login } from '../../utils/auth-utils';
import { editorUrl } from '../../utils/constants';
import { waitFor } from '../../utils/assertion-utils';
import SettingsPage from '../../pages/Settings';
import { tweekManagementClient } from '../../clients/tweek-clients';

const settingsPage = new SettingsPage();

let policies;
let jwtPolicy;
const reset = () => {
  tweekManagementClient.savePolicies(policies);
  tweekManagementClient.saveJWTExtractionPolicy(jwtPolicy);
};

fixture`Edit Policies`.page`${editorUrl}/settings`
  .httpAuth(credentials)
  .beforeEach(login)
  .before(async () => {
    policies = await tweekManagementClient.getPolicies();
    jwtPolicy = await tweekManagementClient.getJWTExtractionPolicy();
  })
  .after(reset);

test('Edit acl policies and save', async (t) => {
  const policiesPage = await settingsPage.openPoliciesPage();

  const editor = await policiesPage.currentTab();
  const data = await editor.read();
  expect(JSON.stringify(policies, null, 4)).eql(data);
  const newData = JSON.stringify(
    [
      ...policies,
      {
        group: 'dummy',
        user: 'dummy',
        contexts: {},
        object: 'values/*',
        action: '*',
        effect: 'allow',
      },
    ],
    null,
    4,
  );

  await editor.update(newData);

  await editor.save();

  await waitFor(async () =>
    expect(JSON.stringify(await tweekManagementClient.getPolicies(), null, 4)).eql(newData),
  );
}).before(async (t) => {
  reset();
  await login(t);
});

test('invalid acl policies, save disabled', async (t) => {
  const policiesPage = await settingsPage.openPoliciesPage();

  const editor = await policiesPage.currentTab();
  const newData = JSON.stringify(
    [
      ...policies,
      {
        group: 'dummy',
        user: 'dummy',
        contexts: {},
        object: 'val/*',
        action: '*',
        effect: 'allow',
      },
    ],
    null,
    4,
  );

  await editor.update(newData);

  await t.expect(editor.hasChanges()).eql(true);
  await t.expect(editor.isValid()).eql(false);
});

test('updated JWT policy and save', async (t) => {
  const policiesPage = await settingsPage.openPoliciesPage();

  const editor = await policiesPage.changeTab('JWT Extraction');
  const newData = jwtPolicy.replace('input.sub', 'input.upn');

  await editor.update(newData);

  await editor.save();

  await waitFor(async () =>
    expect(await tweekManagementClient.getJWTExtractionPolicy()).eql(newData),
  );
}).before(async (t) => {
  reset();
  await login(t);
});

test('Attempt to save JWT policy, show error', async (t) => {
  const policiesPage = await settingsPage.openPoliciesPage();

  const editor = await policiesPage.changeTab('JWT Extraction');
  const newData = jwtPolicy.replace('input.sub', 'inpu"t.upn');

  await editor.update(newData);

  await editor.save();

  await t
    .expect(
      Selector('#ct-container .ct-toast .ct-heading').withExactText('Error saving jwt-policy')
        .visible,
    )
    .ok();
}).before(async (t) => {
  reset();
  await login(t);
});
