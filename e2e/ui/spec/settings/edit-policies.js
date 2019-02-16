import { expect } from 'chai';
import { credentials, login } from '../../utils/auth-utils';
import { editorUrl } from '../../utils/constants';
import { getLocation } from '../../utils/location-utils';
import { waitFor } from '../../utils/assertion-utils';
//import { createConstKey, waitForKeyToBeDeleted } from '../../clients/authoring-client';
//import { waitForValueToEqual } from '../../clients/api-client';
//import { tweekClient } from '../../clients/tweek-clients';
import SettingsPage from '../../pages/Settings';
import { tweekClient, tweekManagementClient } from '../../clients/tweek-clients';

const settingsPage = new SettingsPage();

let policies;
const reset = ()=>tweekManagementClient.savePolicies(policies);

fixture`Edit Policies`.only.page`${editorUrl}/settings`
.httpAuth(credentials)
.beforeEach(login)
.before(async () => {
  policies = await tweekManagementClient.getPolicies()
})
.after(reset);

test('Edit acl policies and save', async (t) => {
  const policiesPage = await settingsPage.openPoliciesPage();
  await t.expect(getLocation()).eql(`${editorUrl}/settings/policies`);

  const editor = await policiesPage.goToTab("ACL");
  const data = await editor.read();
  expect(JSON.stringify(policies, null, 4)).eql(data);
  const newData = JSON.stringify([...policies, {
      "group": "dummy",
      "user": "dummy",
      "contexts": {},
      "object": "values/*",
      "action": "*",
      "effect": "allow"
  }], null, 4);

  await editor.update(newData);
  
  await editor.save();

  await waitFor(async () => 
    expect(JSON.stringify(await tweekManagementClient.getPolicies(), null, 4)).eql(newData)
  );
  
})
.before(async (t)=>{
   reset();
   await login(t);
});

/*
test('invalid acl policies, save disabled', async (t) => {
})

test('updated JWT policy and save', async (t) => {
}).before(async (t) => {
  //await createConstKey('@tweek/schema/delete_property_test', {
  //  Group: {
  //    type: 'string',
  //  },
  //});
  //await login(t);
});


test('Attempt to save JWT policy, show error', async (t) => {  
}).before(async (t) => {
});
*/