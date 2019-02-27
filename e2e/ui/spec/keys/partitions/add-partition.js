import { editorUrl } from '../../../utils/constants';
import { credentials, login } from '../../../utils/auth-utils';
import EditKey from '../../../pages/Keys/EditKey';
import Alert from '../../../pages/Alert';

const editKey = new EditKey();
const alert = new Alert();

fixture`Add Partition`.page`${editorUrl}/keys/behavior_tests/partitions/add_partition`
  .httpAuth(credentials)
  .beforeEach(async (t) => {
    await login(t);
    await t.expect(editKey.container.visible).ok();
  });

test('should not partition if canceled', async (t) => {
  const keySource = await editKey.jpad.getSource();

  await editKey.jpad.partitions.add('user.FavoriteFruit');

  await t.click(alert.cancelButton);

  await t.expect(await editKey.jpad.getSource(false)).eql(keySource);
});

test('should auto-partition correctly if auto-partition was selected', async (t) => {
  await editKey.jpad.partitions.add('user.FavoriteFruit');

  await t.click(alert.button('auto-partition'));

  await t.expect(await editKey.jpad.getSource(false)).eql({
    partitions: ['user.FavoriteFruit'],
    valueType: 'string',
    rules: {
      '*': [
        {
          Matcher: {
            'user.AgentVersion': {
              $ge: '0.12.3',
              $compare: 'version',
            },
          },
          Value: 'agentValue',
          Type: 'SingleVariant',
        },
        {
          Matcher: { 'user.Gender': 'female' },
          Value: 'femaleValue',
          Type: 'SingleVariant',
        },
        {
          Matcher: {},
          Value: 'defaultValue',
          Type: 'SingleVariant',
        },
      ],
      Apple: [
        {
          Matcher: {},
          Value: 'appleValue',
          Type: 'SingleVariant',
        },
      ],
    },
  });
});

test('should not allow auto-partition if matcher is invalid', async (t) => {
  await editKey.jpad.partitions.add('user.AgentVersion');

  await t
    .expect(alert.cancelButton.visible)
    .ok()
    .expect(alert.button('auto-partition').exists)
    .notOk()
    .click(alert.okButton);

  await t.expect(await editKey.jpad.getSource(false)).eql({
    partitions: ['user.AgentVersion'],
    valueType: 'string',
    rules: {},
  });
});
