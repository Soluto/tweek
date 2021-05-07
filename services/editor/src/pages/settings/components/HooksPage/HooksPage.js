import cogoToast from 'cogo-toast';
import qs from 'query-string';
import React, { useEffect, useState } from 'react';
import { useAlerter } from '../../../../contexts/Alerts';
import { tweekManagementClient, useDebounceValue, useErrorNotifier } from '../../../../utils';
import './HooksPage.css';
import { hookLabelsByType } from './HookTypes';
import { webhookLabelsByFormat } from './WebHookFormats';

const HooksPage = ({ location, history }) => {
  const queryFilter = qs.parse(location.search).keyPathFilter;

  const [hooks, setHooks] = useState([]);
  const [deleteError, setDeleteError] = useState(null);
  const [deletingState, setDeletingState] = useState({ isDeleting: false, idBeingDeleted: null });
  const [filter, setFilter] = useState(queryFilter || '');
  const debouncedFilter = useDebounceValue(filter, 500);

  useEffect(() => {
    (async () => setHooks(await tweekManagementClient.getHooks(debouncedFilter)))();
  }, [debouncedFilter]);

  useErrorNotifier(deleteError, 'Failed to delete hook');

  return (
    <div className="hooks-page">
      <ActionBar {...{ filter, setFilter, history }} />
      <h3>Hooks</h3>

      <ul className="hooks-list">
        {hooks.map((hook) => (
          <Hook
            {...{
              key: hook.id,
              hook,
              hooks,
              history,
              setDeleteError,
              setHooks,
              deletingState,
              setDeletingState,
            }}
          />
        ))}
      </ul>
    </div>
  );
};

export default HooksPage;

const ActionBar = ({ filter, setFilter, history }) => (
  <div className="action-bar">
    <button className="metro-button" onClick={() => history.push('/settings/hooks/edit')}>
      Add Hook
    </button>

    <div style={{ position: 'relative' }}>
      <input
        className="keypath-filter"
        type="text"
        value={filter}
        placeholder="Keypath filter (exact match)"
        onChange={(e) => setFilter(e.target.value)}
      />
      {filter !== '' && (
        <button className="clear" onClick={(e) => setFilter('')}>
          X
        </button>
      )}
    </div>
  </div>
);

const Hook = ({
  hook,
  hooks,
  history,
  setDeleteError,
  setHooks,
  deletingState,
  setDeletingState,
}) => (
  <li>
    <div className="actions-wrapper">
      <button
        className="metro-button"
        onClick={() => history.push('/settings/hooks/edit', { hook })}
      >
        Edit
      </button>
      <DeleteButton
        {...{ hook, hooks, setHooks, setDeleteError, deletingState, setDeletingState }}
      />
    </div>
    <div className="hook-data-wrapper">
      <DataField label="Keypath:" value={hook.keyPath} />
      <DataField label="Tags:" value={(hook.tags || []).join()} />
      <DataField label="Type:" value={hookLabelsByType[hook.type]} />
      {hook.type === 'notification_webhook' && (
        <DataField label="Format:" value={webhookLabelsByFormat[hook.format]} />
      )}
      <DataField label="Url:" value={hook.url} />
    </div>
  </li>
);

const DataField = ({ label, value }) => (
  <div className="field-wrapper">
    <label className="field-label">{label}</label>
    <div className="field-value">{value}</div>
  </div>
);

const DeleteButton = ({
  hook,
  hooks,
  setHooks,
  setDeleteError,
  deletingState,
  setDeletingState,
}) => {
  const isBeingDeleted = deletingState.isDeleting && deletingState.idBeingDeleted === hook.id;

  const { showConfirm } = useAlerter();

  const deleteHook = async () => {
    try {
      const alertDetails = {
        title: 'Delete Hook',
        message: 'Are you sure you want to delete this hook?',
      };
      const deleteConfirmation = await showConfirm(alertDetails);
      if (!deleteConfirmation.result) {
        return;
      }

      setDeletingState({ isDeleting: true, idBeingDeleted: hook.id });
      await tweekManagementClient.deleteHook(hook);
      setDeletingState({ isDeleting: false, idBeingDeleted: null });

      setHooks(hooks.filter((h) => h.id !== hook.id));
      cogoToast.success('Hook Deleted');
    } catch (err) {
      setDeletingState({ isDeleting: false, idBeingDeleted: null });
      setDeleteError(err);
    }
  };

  return (
    <button disabled={deletingState.isDeleting} className="delete-hook-button" onClick={deleteHook}>
      {isBeingDeleted ? 'Deleting...' : 'Delete'}
    </button>
  );
};
