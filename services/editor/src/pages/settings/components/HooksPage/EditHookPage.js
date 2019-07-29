import React, { useState, useMemo, useContext, useCallback } from 'react';
import qs from 'query-string';
import { tweekManagementClient, useErrorNotifier } from '../../../../utils';
import { ComboBox, SaveButton } from '../../../../components/common';
import { ReduxContext } from '../../../../store';
import { showSuccess } from '../../../../store/ducks';
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

  const isValid = useMemo(() => validateInput({ keyPath, url }), [keyPath, url]);
  const hasChanges = useMemo(() => checkForChanges({ initialHookData, keyPath, type, url }), [
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
        onClick={useSaveHookCallback({
          id,
          keyPath,
          type,
          url,
          setIsSaving,
          history,
          setSaveError,
          dispatch,
        })}
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

const useSaveHookCallback = ({
  id,
  keyPath,
  type,
  url,
  setIsSaving,
  history,
  setSaveError,
  dispatch,
}) => {
  return useCallback(async () => {
    try {
      setIsSaving(true);

      if (id) await tweekManagementClient.updateHook({ id, keyPath, type, url });
      else await tweekManagementClient.createHook({ keyPath, type, url });

      setIsSaving(false);
      dispatch(showSuccess({ title: 'Hook Saved' }));
      history.goBack();
    } catch (err) {
      setIsSaving(false);
      setSaveError(err);
    }
  }, [id, keyPath, type, url]);
};

const validateInput = ({ keyPath, url }) => Boolean(keyPath && url);

const checkForChanges = ({ initialHookData, keyPath, type, url }) => {
  return (
    keyPath !== initialHookData.keyPath ||
    type !== initialHookData.type ||
    url !== initialHookData.url
  );
};
