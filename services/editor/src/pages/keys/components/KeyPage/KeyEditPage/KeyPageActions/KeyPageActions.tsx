import { equals } from 'ramda';
import React from 'react';
import { SaveButton } from '../../../../../../components/common';
import { useAlerter } from '../../../../../../contexts/Alerts';
import { useKeyActions } from '../../../../../../contexts/SelectedKey/useKeyActions';
import { createUseSelectedKey } from '../../../../../../contexts/SelectedKey/useSelectedKey';
import { buttons } from '../../../../../../store/ducks';
import { AddAliasButton, ArchiveButton, DeleteButton, UnarchiveButton } from './ActionButtons';
import { AddAliasComponent, AliasData } from './AddAliasComponent';
import './KeyPageActions.css';

export type KeyPageActionsProps = {
  isReadonly?: boolean;
  isHistoricRevision?: boolean;
  isInStickyMode?: boolean;
};

const useSelectedKey = createUseSelectedKey(({ remote, manifest, implementation, isSaving }) => {
  return {
    hasChanges:
      !remote ||
      !equals(remote.manifest, manifest) ||
      !equals(remote.implementation, implementation),
    isSaving,
    manifest,
  };
});

const KeyPageActions = ({
  isReadonly,
  isHistoricRevision,
  isInStickyMode,
}: KeyPageActionsProps) => {
  const alerter = useAlerter();
  const { manifest, hasChanges, isSaving } = useSelectedKey()!;
  const { saveKey, addAlias, archiveKey, deleteKey } = useKeyActions();

  const extraButtons = !isInStickyMode;
  const archived = manifest?.meta.archived;

  const onAddAlias = async () => {
    const okButton = {
      ...buttons.OK,
      validate: (data?: AliasData) => data?.validation?.isValid,
    };

    const alertResult = await alerter.showCustomAlert({
      title: `Add alias for ${manifest?.key_path}`,
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
            <UnarchiveButton disabled={isSaving} onClick={() => archiveKey(false)} />
          ) : (
            <ArchiveButton disabled={isSaving} onClick={() => archiveKey(true)} />
          ))}
        {extraButtons && <AddAliasButton disabled={isSaving} onClick={onAddAlias} />}
        <SaveButton
          // todo isValid={isValid}
          isSaving={isSaving}
          hasChanges={hasChanges}
          tabIndex={-1}
          data-comp="save-changes"
          onClick={saveKey}
        />
      </div>
    </div>
  );
};

export default KeyPageActions;
