import * as R from 'ramda';
import React from 'react';
import { SaveButton } from '../../../../../../components/common';
import { useAlerter } from '../../../../../../contexts/Alerts';
import { useSelectedKetActions, useSelectedKey } from '../../../../../../contexts/SelectedKey';
import { buttons } from '../../../../../../store/ducks';
import { useHistorySince } from '../../../../../../utils';
import { AddAliasButton, ArchiveButton, DeleteButton, UnarchiveButton } from './ActionButtons';
import { AddAliasComponent, AliasData } from './AddAliasComponent';
import './KeyPageActions.css';

export type KeyPageActionsProps = {
  isReadonly?: boolean;
  isHistoricRevision?: boolean;
  isInStickyMode?: boolean;
};

const KeyPageActions = ({
  isReadonly,
  isHistoricRevision,
  isInStickyMode,
}: KeyPageActionsProps) => {
  const alerter = useAlerter();
  const historySince = useHistorySince();
  const { local, remote, isSaving, validation } = useSelectedKey()!;
  const { saveKey, addAlias, archiveKey, deleteKey } = useSelectedKetActions();

  const isValid = validation.isValid;
  const hasChanges = !R.equals(local, remote);
  const extraButtons = !isInStickyMode;
  const archived = local && local.manifest.meta.archived;

  const onAddAlias = async () => {
    const okButton = {
      ...buttons.OK,
      validate: (data?: AliasData) => data?.validation?.isValid,
    };

    const alertResult = await alerter.showCustomAlert({
      title: `Add alias for ${local.manifest.key_path}`,
      message: 'Insert a new alias',
      component: AddAliasComponent,
      buttons: [okButton, buttons.CANCEL],
    });

    if (alertResult.result && alertResult.data?.validation?.isValid) {
      addAlias(alertResult.data.keyPath!);
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

export default KeyPageActions;
