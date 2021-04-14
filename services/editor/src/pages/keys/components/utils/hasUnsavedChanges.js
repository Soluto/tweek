import * as R from 'ramda';

const hasUnsavedChanges = ({ selectedKey }, nextLocation, location) => {
  if (
    !selectedKey ||
    selectedKey.isSaving ||
    (nextLocation && location && nextLocation.pathname === location.pathname)
  ) {
    return false;
  }

  const { local, remote } = selectedKey;
  return !R.equals(local, remote);
};

export default hasUnsavedChanges;
