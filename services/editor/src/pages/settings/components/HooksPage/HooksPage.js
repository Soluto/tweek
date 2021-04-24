import cogoToast from 'cogo-toast';
import React, { useState, useEffect, useContext } from 'react';
import qs from 'query-string';
import { debounce, useErrorNotifier, tweekManagementClient } from '../../../../utils';
import { ReduxContext } from '../../../../store';
import { showConfirm } from '../../../../store/ducks';
import { hookLabelsByType } from './HookTypes';
import './HooksPage.css';
import { webhookLabelsByFormat } from './WebHookFormats';

export default ({ location, history }) => {
  const { dispatch } = useContext(ReduxContext);
  const queryFilter = qs.parse(location.search).keyPathFilter;

  const [hooks, setHooks] = useState([]);
  const [deleteError, setDeleteError] = useState(null);
  const [deletingState, setDeletingState] = useState({ isDeleting: false, idBeingDeleted: null });
  const [filter, setFilter] = useState(queryFilter || '');
  const debouncedFilter = debounce(filter, 500);

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
              dispatch,
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
  dispatch,
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
        {...{ hook, hooks, setHooks, setDeleteError, dispatch, deletingState, setDeletingState }}
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
  dispatch,
  deletingState,
  setDeletingState,
}) => {
  const isBeingDeleted = deletingState.isDeleting && deletingState.idBeingDeleted === hook.id;

  return (
    <button
      disabled={deletingState.isDeleting}
      className="delete-hook-button"
      onClick={() =>
        deleteHook({ hook, hooks, setHooks, setDeleteError, dispatch, setDeletingState })
      }
    >
      {isBeingDeleted ? 'Deleting...' : 'Delete'}
    </button>
  );
};

const deleteHook = async ({
  hook,
  hooks,
  setDeleteError,
  dispatch,
  setHooks,
  setDeletingState,
}) => {
  try {
    const alertDetails = {
      title: 'Delete Hook',
      message: 'Are you sure you want to delete this hook?',
    };
    const deleteConfirmation = await dispatch(showConfirm(alertDetails));
    if (!deleteConfirmation.result) return;

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
