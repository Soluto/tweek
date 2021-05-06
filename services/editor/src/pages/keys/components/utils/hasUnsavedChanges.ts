import { equals } from 'ramda';
import { StoreState } from '../../../../store/ducks/types';

const hasUnsavedChanges = ({ selectedKey }: StoreState) => {
  if (!selectedKey || selectedKey.isSaving) {
    return false;
  }

  const { local, remote } = selectedKey;
  return !equals(local, remote);
};

export default hasUnsavedChanges;
