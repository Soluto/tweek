import cogoToast from 'cogo-toast';
import React, { useState, useContext, useCallback } from 'react';
import qs from 'query-string';
import { WithContext as ReactTags } from 'react-tag-input';
import { tweekManagementClient, useErrorNotifier } from '../../../../utils';
import { ComboBox, SaveButton } from '../../../../components/common';
import { ReduxContext } from '../../../../store';
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
  const [type, setType] = useState(initialHookData.type || 'notification_webhook');
  const [format, setFormat] = useState(initialHookData.format);
  const [tags, setTags] = useState(initialHookData.tags || []);
  const [url, setUrl] = useState(initialHookData.url || '');
  const [saveError, setSaveError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const isValid = validateInput({ keyPath, type, url, format });
  const hasChanges = checkForChanges({ initialHookData, keyPath, type, url, format, tags });

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
      <TagsPicker tags={tags} setTags={setTags} />
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
          tags,
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
  if (type !== 'notification_webhook') {
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

const TagsPicker = ({ tags, setTags }) => (
  <div className="tags-picker">
    <label className="field-label">Tags:</label>
    <ReactTags
      tags={tags.map((tag) => ({ id: tag, text: tag }))}
      handleDelete={(index) => setTags(tags.filter((t, i) => i !== index))}
      handleAddition={(tag) => setTags([...tags, tag.text])}
      placeholder="New tag"
      autofocus={false}
      allowDeleteFromEmptyInput
      allowDragDrop={false}
      minQueryLength={1}
      classNames={{
        tags: 'tags-container',
        tagInput: 'tag-input',
        tag: 'tag',
        remove: 'tag-delete-button',
        suggestions: 'tags-suggestion',
      }}
    />
  </div>
);

const useSaveHookCallback = ({
  id,
  keyPath,
  type,
  format,
  url,
  tags,
  setIsSaving,
  history,
  setSaveError,
}) =>
  useCallback(async () => {
    try {
      setIsSaving(true);

      if (id) await tweekManagementClient.updateHook({ id, keyPath, type, url, format, tags });
      else await tweekManagementClient.createHook({ keyPath, type, url, format, tags });

      setIsSaving(false);
      cogoToast.success('Hook Saved');
      history.goBack();
    } catch (err) {
      setIsSaving(false);
      setSaveError(err);
    }
  }, [id, keyPath, type, url, format, tags]); //eslint-disable-line react-hooks/exhaustive-deps

const validateInput = ({ keyPath, type, url, format }) =>
  Boolean(keyPath && type && url && (type === 'notification_webhook' ? format : true));

const checkForChanges = ({ initialHookData, keyPath, type, url, format, tags }) =>
  keyPath !== initialHookData.keyPath ||
  type !== initialHookData.type ||
  url !== initialHookData.url ||
  format !== initialHookData.format ||
  tags !== initialHookData.tags;
