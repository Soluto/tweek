import cogoToast from 'cogo-toast';
import React, { useState, useEffect, useContext } from 'react';
import { useErrorNotifier, tweekManagementClient } from '../../../../utils';
import { ReduxContext } from '../../../../store';
import { showCustomAlert, showConfirm } from '../../../../store/ducks';
import createAlert from './CreateExternalAppSecret';
import './ExternalAppsPage.css';

export default ({ history }) => {
  const { dispatch } = useContext(ReduxContext);

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
              dispatch,
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
  dispatch,
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
            dispatch,
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
  dispatch,
  deletingState,
  setDeletingState,
}) => {
  const isBeingDeleted =
    deletingState.isDeleting && deletingState.idBeingDeleted === externalApp.id;

  return (
    <button
      disabled={deletingState.isDeleting}
      className="delete-external-app-button"
      onClick={() =>
        deleteExternalApp({
          externalApp,
          externalApps,
          setExternalApps,
          setDeleteError,
          dispatch,
          setDeletingState,
        })
      }
    >
      {isBeingDeleted ? 'Deleting...' : 'Delete'}
    </button>
  );
};

const deleteExternalApp = async ({
  externalApp,
  externalApps,
  setDeleteError,
  dispatch,
  setExternalApps,
  setDeletingState,
}) => {
  try {
    const alertDetails = {
      title: 'Delete External App',
      message: 'Are you sure you want to delete this external app?',
    };
    const deleteConfirmation = await dispatch(showConfirm(alertDetails));
    if (!deleteConfirmation.result) return;

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

const AddExternalAppSecretButton = ({ externalApp, setSecrets }) => {
  const { dispatch } = useContext(ReduxContext);

  const [additionError, setAdditionError] = useState(null);
  const [additionState, setAdditionState] = useState(false);

  const isBeingAdding = additionState;

  useErrorNotifier(additionError, 'Failed to add external app secret');

  return (
    <button
      disabled={isBeingAdding}
      className="metro-button"
      onClick={() =>
        addExternalAppSecretKey({
          externalApp,
          setSecrets,
          setAdditionError,
          dispatch,
          setAdditionState,
        })
      }
    >
      {isBeingAdding ? 'Adding Secret...' : 'Add Secret'}
    </button>
  );
};

const DeleteExternalAppSecretButton = ({ secretKey, externalApp, setSecrets }) => {
  const { dispatch } = useContext(ReduxContext);

  const [deleteError, setDeleteError] = useState(null);
  const [deletingState, setDeletingState] = useState({ isDeleting: false, idBeingDeleted: null });

  const isBeingDeleted = deletingState.isDeleting && deletingState.idBeingDeleted === secretKey.id;

  useErrorNotifier(deleteError, 'Failed to delete external app secret');
  return (
    <button
      disabled={deletingState.isDeleting}
      className="metro-button"
      onClick={() =>
        deleteExternalAppSecretKey({
          id: secretKey.id,
          externalApp,
          setSecrets,
          setDeleteError,
          dispatch,
          setDeletingState,
        })
      }
    >
      {isBeingDeleted ? 'Deleting Secret...' : 'Delete Secret'}
    </button>
  );
};

const addExternalAppSecretKey = async ({
  externalApp,
  setSecrets,
  setAdditionError,
  dispatch,
  setAdditionState,
}) => {
  try {
    const alertDetails = {
      title: 'Add External App Secret',
      message: 'Are you sure you want to add new external app secret?',
    };
    const additionConfirmation = await dispatch(showConfirm(alertDetails));
    if (!additionConfirmation.result) return;

    setAdditionState(true);
    const { keyId, secret } = await tweekManagementClient.createExternalAppSecretKey(
      externalApp.id,
    );
    await dispatch(showCustomAlert(createAlert(externalApp.id, secret)));
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

const deleteExternalAppSecretKey = async ({
  id,
  externalApp,
  setSecrets,
  setDeleteError,
  dispatch,
  setDeletingState,
}) => {
  try {
    const alertDetails = {
      title: 'Delete External App Secret',
      message: 'Are you sure you want to delete this external app secret?',
    };
    const deleteConfirmation = await dispatch(showConfirm(alertDetails));
    if (!deleteConfirmation.result) return;

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
