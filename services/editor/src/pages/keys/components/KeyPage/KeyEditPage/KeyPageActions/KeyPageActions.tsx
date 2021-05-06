import * as R from 'ramda';
import React from 'react';
import { connect } from 'react-redux';
import { SaveButton } from '../../../../../../components/common';
import { useAlerter } from '../../../../../../contexts/Alerts';
import { buttons } from '../../../../../../store/ducks';
import {
  addAlias,
  archiveKey,
  deleteKey,
  saveKey,
} from '../../../../../../store/ducks/selectedKey';
import { KeyActions, SelectedKey, StoreState } from '../../../../../../store/ducks/types';
import { useHistorySince } from '../../../../../../utils';
import { AddAliasButton, ArchiveButton, DeleteButton, UnarchiveButton } from './ActionButtons';
import { AddAliasComponent, AliasData } from './AddAliasComponent';
import './KeyPageActions.css';

type Actions = Pick<KeyActions, 'saveKey' | 'addAlias' | 'archiveKey' | 'deleteKey'>;

type StateProps = {
  selectedKey: SelectedKey;
  isValid: boolean;
};

const enhance = connect<StateProps, Actions, {}, StoreState>(
  (state) => ({ selectedKey: state.selectedKey!, isValid: state.selectedKey!.validation.isValid }),
  {
    saveKey,
    addAlias,
    archiveKey,
    deleteKey,
  },
);

export type KeyPageActionsProps = StateProps &
  Actions & {
    isReadonly?: boolean;
    isHistoricRevision?: boolean;
    isInStickyMode?: boolean;
  };

const KeyPageActions = ({
  selectedKey: { key, local, remote, isSaving },
  isReadonly,
  isHistoricRevision,
  isValid,
  isInStickyMode,
  saveKey,
  addAlias,
  archiveKey,
  deleteKey,
}: KeyPageActionsProps) => {
  const alerter = useAlerter();
  const historySince = useHistorySince();

  const hasChanges = !R.equals(local, remote);
  const extraButtons = !isInStickyMode;
  const archived = local && local.manifest.meta.archived;

  const onAddAlias = async () => {
    const okButton = {
      ...buttons.OK,
      validate: (data?: AliasData) => data?.validation?.isValid,
    };

    const alertResult = await alerter.showCustomAlert({
      title: `Add alias for ${key}`,
      message: 'Insert a new alias',
      component: AddAliasComponent,
      buttons: [okButton, buttons.CANCEL],
    });

    if (alertResult.result && alertResult.data?.validation?.isValid) {
      addAlias(alertResult.data.displayName!);
    }
  };

  return (
    <div>
      {isReadonly && (
        <div className="readonly-key-message" data-comp="key-message">
          {isHistoricRevision ? 'This is an old revision of this key' : 'This key is readonly'}
        </div>
      )}
      <div className="key-action-buttons-wrapper">
        {extraButtons && archived && <DeleteButton disabled={isSaving} onClick={deleteKey} />}
        {extraButtons &&
          (archived ? (
            <UnarchiveButton disabled={isSaving} onClick={() => archiveKey(false, historySince)} />
          ) : (
            <ArchiveButton disabled={isSaving} onClick={() => archiveKey(true, historySince)} />
          ))}
        {extraButtons && <AddAliasButton disabled={isSaving} onClick={onAddAlias} />}
        <SaveButton
          isValid={isValid}
          isSaving={isSaving}
          hasChanges={hasChanges}
          tabIndex={-1}
          data-comp="save-changes"
          onClick={() => saveKey(historySince)}
        />
      </div>
    </div>
  );
};

export default enhance(KeyPageActions);
