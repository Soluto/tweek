import { expect } from 'chai';
import { editorUrl } from '../../utils/constants';
import { credentials, login } from '../../utils/auth-utils';
import KeysPage from '../../pages/Keys';

const keysPage = new KeysPage();

fixture`MultiVariant Value Type`.page`${editorUrl}/keys`.httpAuth(credentials).beforeEach(login);

test('should succeed editing boolean value type', async (t) => {
  const expectedValue = {
    Matcher: {},
    Type: 'MultiVariant',
    OwnerType: 'user',
    ValueDistribution: {
      type: 'bernoulliTrial',
      args: 0.1,
    },
  };

  const newKey = await keysPage.addNewKey();
  await t
    .typeText(newKey.nameInput, 'multi/boolean', { replace: true })
    .typeText(newKey.valueTypeSelector, 'boolean', { replace: true });

  const editKey = await newKey.continue();
  const rule = await editKey.jpad.newRule.add();

  await t.click(rule.newCondition.deleteButton);
  const multiVariantValue = await rule.toMultiVariant();

  await t
    .typeText(multiVariantValue.identity, 'user', { replace: true })
    .click(editKey.jpad.sourceTab);

  const {
    rules: [ruleSource],
  } = await editKey.jpad.sourceEditor.getSource();

  expect(ruleSource).to.have.property('Salt');

  const salt = ruleSource.Salt;
  expect(salt).to.not.equal('');
  delete ruleSource.Salt;

  expect(ruleSource).to.deep.equal(expectedValue);

  await t.click(editKey.jpad.rulesTab);

  await multiVariantValue.toSingleValue();
  await rule.toMultiVariant();

  await t.click(editKey.jpad.sourceTab);
  const {
    rules: [newRuleSource],
  } = await editKey.jpad.sourceEditor.getSource();
  expect(newRuleSource.Salt).to.equal(salt);
});

test('should succeed editing other value types', async (t) => {
  const args = [
    {
      value: 'value_one',
      weight: 15,
    },
    {
      value: 'value_two',
      weight: 25,
    },
    {
      value: 'value_thee',
      weight: 60,
    },
  ];
  const expectedValue = {
    Matcher: {},
    Type: 'MultiVariant',
    OwnerType: 'other',
    ValueDistribution: {
      type: 'weighted',
      args,
    },
  };

  const newKey = await keysPage.addNewKey();
  await t.typeText(newKey.nameInput, 'multi/string', { replace: true });

  const editKey = await newKey.continue();
  const rule = await editKey.jpad.newRule.add();

  await t.click(rule.newCondition.deleteButton);
  const multiVariantValue = await rule.toMultiVariant();
  await multiVariantValue.setValues(args);

  await t
    .typeText(multiVariantValue.identity, 'other', { replace: true })
    .click(editKey.jpad.sourceTab);

  const {
    rules: [ruleSource],
  } = await editKey.jpad.sourceEditor.getSource();

  expect(ruleSource).to.have.property('Salt');

  const salt = ruleSource.Salt;
  expect(salt).to.not.equal('');
  delete ruleSource.Salt;

  expect(ruleSource).to.deep.equal(expectedValue);

  await t.click(editKey.jpad.rulesTab);

  await multiVariantValue.toSingleValue();
  await rule.toMultiVariant();

  await t.click(editKey.jpad.sourceTab);
  const {
    rules: [newRuleSource],
  } = await editKey.jpad.sourceEditor.getSource();
  expect(newRuleSource.Salt).to.equal(salt);
});
