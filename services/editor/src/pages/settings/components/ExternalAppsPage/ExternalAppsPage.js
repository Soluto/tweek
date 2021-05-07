import cogoToast from 'cogo-toast';
import React, { useEffect, useState } from 'react';
import { useAlerter } from '../../../../contexts/Alerts';
import { tweekManagementClient, useErrorNotifier } from '../../../../utils';
import createAlert from './CreateExternalAppSecret';
import './ExternalAppsPage.css';

const ExternalAppsPage = ({ history }) => {
  const [externalApps, setExternalApps] = useState([]);
  const [deleteError, setDeleteError] = useState(null);
  const [deletingState, setDeletingState] = useState({ isDeleting: false, idBeingDeleted: null });

  useEffect(() => {
    (async () => setExternalApps(await tweekManagementClient.getExternalApps()))();
  }, []);

  useErrorNotifier(deleteError, 'Failed to delete external app');
  return (
    <div className="external-apps-page">
      <ActionBar {...{ history }} />
      <h3>Apps</h3>

      <ul className="external-apps-list">
        {externalApps.map((externalApp) => (
          <ExternalApp
            {...{
              key: externalApp.id,
              externalApp,
              externalApps,
              history,
              setDeleteError,
              setExternalApps,
              deletingState,
              setDeletingState,
            }}
          />
        ))}
      </ul>
    </div>
  );
};

export default ExternalAppsPage;

const ActionBar = ({ history }) => (
  <div className="action-bar">
    <button className="metro-button" onClick={() => history.push('/settings/externalApps/edit')}>
      Add External App
    </button>
  </div>
);

const ExternalApp = ({
  externalApp,
  externalApps,
  history,
  setDeleteError,
  setExternalApps,
  deletingState,
  setDeletingState,
}) => {
  const [secrets, setSecrets] = useState(externalApp.secretKeys);
  return (
    <li>
      <div className="external-app-data-wrapper">
        <h4>Details</h4>
        <DataField label="Name:" value={externalApp.name} />
        <DataField label="Version:" value={externalApp.version} />
        <DataField label="Permissions:" value={externalApp.permissions.join(',')} />
      </div>
      <div className="external-app-secrets-wrapper">
        <div className="external-app-secrets-action-bar">
          <h4>Secrets</h4>
          <AddExternalAppSecretButton {...{ externalApp, setSecrets }} />
        </div>
        <ul className="external-app-secrets-list">
          {secrets.map((secretKey) => (
            <ExternalAppSecret {...{ key: secretKey.id, secretKey, externalApp, setSecrets }} />
          ))}
        </ul>
      </div>
      <div className="actions-wrapper">
        <button
          className="metro-button"
          onClick={() => history.push('/settings/externalApps/edit', { externalApp })}
        >
          Edit
        </button>
        <DeleteButton
          {...{
            externalApp,
            externalApps,
            setExternalApps,
            setDeleteError,
            deletingState,
            setDeletingState,
          }}
        />
      </div>
    </li>
  );
};

const DataField = ({ label, value }) => (
  <div className="field-wrapper">
    <label className="field-label">{label}</label>
    <div className="field-value">{value}</div>
  </div>
);

const ExternalAppSecret = ({ secretKey, externalApp, setSecrets }) => (
  <li>
    <div className="external-app-secret">
      <label className="field-label" title={new Date(secretKey.creationDate).toString()}>
        {new Date(secretKey.creationDate).toLocaleDateString()}
      </label>
      <DeleteExternalAppSecretButton {...{ secretKey, externalApp, setSecrets }} />
    </div>
  </li>
);

const DeleteButton = ({
  externalApp,
  externalApps,
  setExternalApps,
  setDeleteError,
  deletingState,
  setDeletingState,
}) => {
  const isBeingDeleted =
    deletingState.isDeleting && deletingState.idBeingDeleted === externalApp.id;

  const { showConfirm } = useAlerter();

  const deleteExternalApp = async () => {
    try {
      const alertDetails = {
        title: 'Delete External App',
        message: 'Are you sure you want to delete this external app?',
      };
      const deleteConfirmation = await showConfirm(alertDetails);
      if (!deleteConfirmation.result) {
        return;
      }

      setDeletingState({ isDeleting: true, idBeingDeleted: externalApp.id });
      await tweekManagementClient.deleteExternalApp(externalApp.id);
      setDeletingState({ isDeleting: false, idBeingDeleted: null });

      setExternalApps(externalApps.filter((h) => h.id !== externalApp.id));
      cogoToast.success('External App Deleted');
    } catch (err) {
      setDeletingState({ isDeleting: false, idBeingDeleted: null });
      setDeleteError(err);
    }
  };

  return (
    <button
      disabled={deletingState.isDeleting}
      className="delete-external-app-button"
      onClick={deleteExternalApp}
    >
      {isBeingDeleted ? 'Deleting...' : 'Delete'}
    </button>
  );
};

const AddExternalAppSecretButton = ({ externalApp, setSecrets }) => {
  const { showCustomAlert, showConfirm } = useAlerter();
  const [additionError, setAdditionError] = useState(null);
  const [additionState, setAdditionState] = useState(false);

  const isBeingAdding = additionState;

  useErrorNotifier(additionError, 'Failed to add external app secret');

  const addExternalAppSecretKey = async () => {
    try {
      const alertDetails = {
        title: 'Add External App Secret',
        message: 'Are you sure you want to add new external app secret?',
      };
      const additionConfirmation = await showConfirm(alertDetails);
      if (!additionConfirmation.result) {
        return;
      }

      setAdditionState(true);
      const { keyId, secret } = await tweekManagementClient.createExternalAppSecretKey(
        externalApp.id,
      );
      await showCustomAlert(createAlert(externalApp.id, secret));
      setAdditionState(false);

      const newSecret = { id: keyId, creationDate: new Date().toISOString() };
      externalApp.secretKeys = [...externalApp.secretKeys, newSecret];
      setSecrets(externalApp.secretKeys);
      cogoToast.success('External App Secret Added');
    } catch (err) {
      setAdditionState(false);
      setAdditionError(err);
    }
  };

  return (
    <button disabled={isBeingAdding} className="metro-button" onClick={addExternalAppSecretKey}>
      {isBeingAdding ? 'Adding Secret...' : 'Add Secret'}
    </button>
  );
};

const DeleteExternalAppSecretButton = ({ secretKey, externalApp, setSecrets }) => {
  const { showConfirm } = useAlerter();
  const [deleteError, setDeleteError] = useState(null);
  const [deletingState, setDeletingState] = useState({ isDeleting: false, idBeingDeleted: null });

  const isBeingDeleted = deletingState.isDeleting && deletingState.idBeingDeleted === secretKey.id;

  useErrorNotifier(deleteError, 'Failed to delete external app secret');

  const deleteExternalAppSecretKey = async () => {
    const id = secretKey.id;
    try {
      const alertDetails = {
        title: 'Delete External App Secret',
        message: 'Are you sure you want to delete this external app secret?',
      };
      const deleteConfirmation = await showConfirm(alertDetails);
      if (!deleteConfirmation.result) {
        return;
      }

      setDeletingState({ isDeleting: true, idBeingDeleted: externalApp.id });
      await tweekManagementClient.deleteExternalAppSecretKey(externalApp.id, id);
      setDeletingState({ isDeleting: false, idBeingDeleted: null });

      externalApp.secretKeys = externalApp.secretKeys.filter((s) => s.id !== id);
      setSecrets(externalApp.secretKeys);
      cogoToast.success('External App Secret Deleted');
    } catch (err) {
      setDeletingState({ isDeleting: false, idBeingDeleted: null });
      setDeleteError(err);
    }
  };

  return (
    <button
      disabled={deletingState.isDeleting}
      className="metro-button"
      onClick={deleteExternalAppSecretKey}
    >
      {isBeingDeleted ? 'Deleting Secret...' : 'Delete Secret'}
    </button>
  );
};
