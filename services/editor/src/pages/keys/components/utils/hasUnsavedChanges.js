import * as R from 'ramda';

const hasUnsavedChanges = ({ selectedKey }) => {
  if (!selectedKey || selectedKey.isSaving) return false;

  const { local, remote } = selectedKey;
  return !R.equals(local, remote);
};

export default hasUnsavedChanges;
