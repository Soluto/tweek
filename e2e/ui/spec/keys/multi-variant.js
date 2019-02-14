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

  await t.typeText(multiVariantValue.identity, 'user', { replace: true });

  const {
    rules: [firstRuleSource],
  } = await editKey.jpad.getSource();
  const { Salt: firstSalt, ...ruleSource } = firstRuleSource;

  await t
    .expect(firstSalt)
    .ok()
    .expect(ruleSource)
    .eql(expectedValue);

  await multiVariantValue.toSingleValue();
  await rule.toMultiVariant();

  const {
    rules: [{ Salt: newSalt }],
  } = await editKey.jpad.getSource(true);

  await t.expect(newSalt).eql(firstSalt);
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

  await t.typeText(multiVariantValue.identity, 'other', { replace: true });

  const {
    rules: [firstRuleSource],
  } = await editKey.jpad.getSource();
  const { Salt: firstSalt, ...ruleSource } = firstRuleSource;

  await t
    .expect(firstSalt)
    .ok()
    .expect(ruleSource)
    .eql(expectedValue);

  await multiVariantValue.toSingleValue();
  await rule.toMultiVariant();

  const {
    rules: [{ Salt: newSalt }],
  } = await editKey.jpad.getSource(true);

  await t.expect(newSalt).eql(firstSalt);
});
