import React, { useState, useMemo, useContext, useCallback } from 'react';
import qs from 'query-string';
import { tweekManagementClient, useErrorNotifier } from '../../../../utils';
import { ComboBox, SaveButton } from '../../../../components/common';
import { ReduxContext } from '../../../../store';
import { showSuccess } from '../../../../store/ducks';
import { hookTypes, hookLabelsByType } from './HookTypes';
import './EditHookPage.css';
import { webhookFormats, webhookLabelsByFormat } from './WebHookFormats';

export default ({ location, history }) => {
  const { dispatch } = useContext(ReduxContext);
  const initialHookData = (location.state && location.state.hook) || {};
  const id = initialHookData.id;
  const isEditPage = Boolean(id);
  const keyPathFromQuery = qs.parse(location.search).keyPath;

  const [keyPath, setKeyPath] = useState(initialHookData.keyPath || keyPathFromQuery || '');
  const [type, setType] = useState(initialHookData.type || 'webhook');
  const [format, setFormat] = useState(initialHookData.format);
  const [url, setUrl] = useState(initialHookData.url || '');
  const [saveError, setSaveError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const isValid = useMemo(() => validateInput({ keyPath, type, url, format }), [keyPath, type, url, format]);
  const hasChanges = useMemo(() => checkForChanges({ initialHookData, keyPath, type, url, format }), [
    keyPath,
    type,
    url,
    format
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
      <HookFormatSelector {...{ setFormat, format, type }} />
      <TextField label="Url:" value={url} setter={setUrl} />

      <SaveButton
        {...{ isSaving, isValid, hasChanges }}
        onClick={useSaveHookCallback({
          id,
          keyPath,
          type,
          url,
          format,
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
  <div className="hook-field-selector-container">
    <label className="field-label">Type:</label>
    <div className="hook-field-selector-wrapper">
      <ComboBox
        className="hook-field-selector"
        suggestions={hookTypes}
        value={hookLabelsByType[type]}
        showValueInOptions={true}
        onChange={(input, selected) => selected && setType(selected.value)}
      />
    </div>
  </div>
);

const HookFormatSelector = ({ setFormat, format, type }) => {
  if(type!=='webhook') {
    return null;
  }
  return (
    <div className="hook-field-selector-container">
      <label className="field-label">Format:</label>
      <div className="hook-field-selector-wrapper">
        <ComboBox
          className="hook-field-selector"
          suggestions={webhookFormats}
          value={webhookLabelsByFormat[format]}
          showValueInOptions={true}
          onChange={(input, selected) => selected && setFormat(selected.value)}
        />
      </div>
    </div>
  );
};

const useSaveHookCallback = ({
  id,
  keyPath,
  type,
  format,
  url,
  setIsSaving,
  history,
  setSaveError,
  dispatch,
}) =>
  useCallback(async () => {
    try {
      setIsSaving(true);

      if (id) await tweekManagementClient.updateHook({ id, keyPath, type, url, format });
      else await tweekManagementClient.createHook({ keyPath, type, url, format });

      setIsSaving(false);
      dispatch(showSuccess({ title: 'Hook Saved' }));
      history.goBack();
    } catch (err) {
      setIsSaving(false);
      setSaveError(err);
    }
  }, [id, keyPath, type, url, format]);

const validateInput = ({ keyPath, type, url, format }) => Boolean(keyPath && type && url && (type === 'webhook' ? format : true));

const checkForChanges = ({ initialHookData, keyPath, type, url, format }) =>
  (
    keyPath !== initialHookData.keyPath ||
    type !== initialHookData.type ||
    url !== initialHookData.url ||
    format !== initialHookData.format
  );
