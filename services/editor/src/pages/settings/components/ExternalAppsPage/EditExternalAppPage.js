import cogoToast from 'cogo-toast';
import React, { useCallback, useState } from 'react';
import { WithContext as ReactTags } from 'react-tag-input';
import { SaveButton } from '../../../../components/common';
import { useAlerter } from '../../../../contexts/Alerts';
import { tweekManagementClient, useErrorNotifier } from '../../../../utils';
import createAlert from './CreateExternalAppSecret';
import './EditExternalAppPage.css';

const EditExternalAppPage = ({ location, history }) => {
  const initialExternalAppData = (location.state && location.state.externalApp) || {};
  const id = initialExternalAppData.id;
  const isEditPage = Boolean(id);

  const [name, setName] = useState(initialExternalAppData.name || '');
  const [permissions, setPermissions] = useState(initialExternalAppData.permissions || []);
  const [saveError, setSaveError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const isValid = validateInput({ name, permissions });
  const hasChanges = checkForChanges({ initialExternalAppData, name, permissions });

  useErrorNotifier(saveError, 'Failed to save external app');

  return (
    <div className="edit-external-app-page">
      <h3>{isEditPage ? 'Edit External App' : 'Add New External App'}</h3>

      <TextField label="Name:" value={name} setter={setName} />
      <PermissionsPicker permissions={permissions} setPermissions={setPermissions} />

      <SaveButton
        {...{ isSaving, isValid, hasChanges }}
        onClick={useSaveExternalAppCallback({
          id,
          name,
          permissions,
          setIsSaving,
          history,
          setSaveError,
        })}
      />
    </div>
  );
};

export default EditExternalAppPage;

const TextField = ({ label, value, setter, placeholder }) => (
  <div className="field-input-wrapper">
    <label className="field-label">{label}</label>
    <input type="text" onChange={(e) => setter(e.target.value)} {...{ value, placeholder }} />
  </div>
);

const PermissionsPicker = ({ permissions, setPermissions }) => (
  <div className="permissions-picker">
    <label className="field-label">Permissions:</label>
    <ReactTags
      tags={permissions.map((permission) => ({ id: permission, text: permission }))}
      handleDelete={(index) => setPermissions(permissions.filter((_, i) => i !== index))}
      handleAddition={(permission) => setPermissions([...permissions, permission.text])}
      placeholder="New permission"
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

const useSaveExternalAppCallback = ({
  id,
  name,
  permissions,
  setIsSaving,
  history,
  setSaveError,
}) => {
  const { showCustomAlert } = useAlerter();

  return useCallback(async () => {
    try {
      setIsSaving(true);

      if (id) {
        await tweekManagementClient.updateExternalApp(id, { name, permissions });
      } else {
        const { appId, appSecret } = await tweekManagementClient.createExternalApp({
          name,
          permissions,
        });
        await showCustomAlert(createAlert(appId, appSecret));
      }

      setIsSaving(false);
      cogoToast.success('External App Saved');
      history.goBack();
    } catch (err) {
      setIsSaving(false);
      setSaveError(err);
    }
  }, [id, name, permissions, showCustomAlert]); //eslint-disable-line react-hooks/exhaustive-deps
};

const validateInput = ({ name, permissions }) =>
  Boolean(name && permissions && Array.isArray(permissions));

const checkForChanges = ({ initialExternalAppData, name, permissions }) =>
  name !== initialExternalAppData.name || permissions !== initialExternalAppData.permissions;
