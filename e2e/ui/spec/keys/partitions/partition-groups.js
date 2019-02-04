import { editorUrl } from '../../../utils/constants';
import { credentials, login } from '../../../utils/auth-utils';
import EditKey from '../../../pages/Keys/EditKey';
import Alert from '../../../pages/Alert';

const testFolder = 'behavior_tests/partitions';
const alert = new Alert();

fixture`Partition Groups`.page`${editorUrl}/keys`.httpAuth(credentials).beforeEach(login);

test('should add new partition group', async (t) => {
  const editKey = await EditKey.open(`${testFolder}/add_partition_group`);

  const newPartitionGroups = [
    { 'user.FavoriteFruit': 'Banana' },
    {
      'user.FavoriteFruit': 'Orange',
      'user.FatherName': 'Rick',
    },
    { 'user.FatherName': 'Morty' },
  ];

  for (const group of newPartitionGroups) {
    for (const [property, value] of Object.entries(group)) {
      await t.typeText(editKey.jpad.newPartition.propertyValue(property), value, { replace: true });
    }
    await t.click(editKey.jpad.newPartition.addButton);
  }

  await t.expect(await editKey.jpad.getSource(false)).eql({
    partitions: ['user.FavoriteFruit', 'user.FatherName'],
    valueType: 'string',
    rules: {
      Banana: {
        '*': [],
      },
      Orange: {
        Rick: [],
      },
      '*': {
        Morty: [],
      },
    },
  });
});

test('should delete group rules when deleting partition group', async (t) => {
  const editKey = await EditKey.open(`${testFolder}/partition_groups`);

  await t
    .click(editKey.jpad.partitionGroup(['banana', 'default']).deleteButton)
    .click(alert.okButton);

  await t.expect(await editKey.jpad.getSource(false)).eql({
    partitions: ['user.FavoriteFruit', 'user.Gender'],
    valueType: 'string',
    rules: {
      Banana: {
        male: [
          {
            Matcher: {},
            Value: 'someValue',
            Type: 'SingleVariant',
          },
        ],
      },
      '*': {
        '*': [
          {
            Matcher: {},
            Value: 'otherDefaultValue',
            Type: 'SingleVariant',
          },
        ],
      },
    },
  });
});
