import React, { useState, useEffect, useContext } from 'react';
import qs from 'query-string';
import { tweekManagementClient } from '../../../../utils/tweekClients';
import ComboBox from '../../../../components/common/ComboBox/ComboBox';
import SaveButton from '../../../../components/common/SaveButton/SaveButton';
import useErrorNotifier from '../../../../utils/useErrorNotifier';
import { ReduxContext } from '../../../../store';
import { showSuccess } from '../../../../store/ducks/notifications';
import { hookTypes, hookLabelsByType } from './HookTypes';
import './EditHookPage.css';

export default ({ location, history }) => {
  const { dispatch } = useContext(ReduxContext);
  const initialHookData = (location.state && location.state.hook) || {};
  const id = initialHookData.id;
  const isEditPage = Boolean(id);
  const keyPathFromQuery = qs.parse(location.search).keyPath;

  const [keyPath, setKeyPath] = useState(initialHookData.keyPath || keyPathFromQuery || '');
  const [type, setType] = useState(initialHookData.type || 'notification_webhook');
  const [url, setUrl] = useState(initialHookData.url || '');
  const [saveError, setSaveError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => validateInput({ keyPath, url, setIsValid }), [keyPath, url]);
  useEffect(() => checkForChanges({ initialHookData, keyPath, type, url, setHasChanges }), [
    keyPath,
    type,
    url,
  ]);
  useErrorNotifier(saveError, 'Failed to save hook');

  return (
    <div className="edit-hook-page">
      <h3>{isEditPage ? 'Edit Hook' : 'Add New Hook'}</h3>

      <TextField
        label="Keypath:"
        value={keyPath}
        setter={setKeyPath}
        placeholder="Exact match, allows * wildcard"
      />
      <HookTypeSelector {...{ setType, type }} />
      <TextField label="Url:" value={url} setter={setUrl} />

      <SaveButton
        {...{ isSaving, isValid, hasChanges }}
        onClick={() =>
          saveHook({ id, keyPath, type, url, setIsSaving, history, setSaveError, dispatch })
        }
      />
    </div>
  );
};

const TextField = ({ label, value, setter, placeholder }) => (
  <div className="field-input-wrapper">
    <label className="field-label">{label}</label>
    <input type="text" onChange={(e) => setter(e.target.value)} {...{ value, placeholder }} />
  </div>
);

const HookTypeSelector = ({ setType, type }) => (
  <div className="hook-type-selector-container">
    <label className="field-label">Type:</label>
    <div className="hook-type-selector-wrapper">
      <ComboBox
        className="hook-type-selector"
        suggestions={hookTypes}
        value={hookLabelsByType[type]}
        showValueInOptions={true}
        onChange={(input, selected) => selected && setType(selected.value)}
      />
    </div>
  </div>
);

const saveHook = async ({
  id,
  keyPath,
  type,
  url,
  setIsSaving,
  history,
  setSaveError,
  dispatch,
}) => {
  try {
    setIsSaving(true);

    if (id) await tweekManagementClient.updateHook({ id, keyPath, type, url });
    else await tweekManagementClient.createHook({ keyPath, type, url });

    setIsSaving(false);
    dispatch(showSuccess({ title: 'Hook Saved' }));
    history.push('/settings/hooks');
  } catch (err) {
    setIsSaving(false);
    setSaveError(err);
  }
};

const validateInput = ({ keyPath, url, setIsValid }) => setIsValid(Boolean(keyPath && url));

const checkForChanges = ({ initialHookData, keyPath, type, url, setHasChanges }) => {
  setHasChanges(
    keyPath !== initialHookData.keyPath ||
      type !== initialHookData.type ||
      url !== initialHookData.url,
  );
};
