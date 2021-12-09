import { equals } from 'ramda';
import React from 'react';
import { SaveButton } from '../../../../../../components/common';
import { AlertButton, buttons, useAlerter } from '../../../../../../contexts/Alerts';
import { createUseSelectedKey, useKeyActions } from '../../../../../../contexts/SelectedKey';
import {
  AddAliasButton,
  ArchiveButton,
  DeleteButton,
  ResetButton,
  UnarchiveButton,
} from './ActionButtons';
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
    isNew: !remote,
  };
});

const KeyPageActions = ({
  isReadonly,
  isHistoricRevision,
  isInStickyMode,
}: KeyPageActionsProps) => {
  const alerter = useAlerter();
  const { manifest, hasChanges, isSaving, isNew } = useSelectedKey();
  const { saveKey, addAlias, archiveKey, deleteKey, resetKey } = useKeyActions();

  const extraButtons = !isInStickyMode && !isNew;
  const archived = manifest?.meta.archived;

  const onAddAlias = async () => {
    const okButton: AlertButton<AliasData> = {
      ...buttons.OK,
      validate: (data) => data?.validation?.isValid,
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
        {extraButtons && (
          <>
            {archived ? (
              <>
                <DeleteButton disabled={isSaving} onClick={deleteKey} />
                <UnarchiveButton disabled={isSaving} onClick={() => archiveKey(false)} />
              </>
            ) : (
              <ArchiveButton disabled={isSaving} onClick={() => archiveKey(true)} />
            )}
            <AddAliasButton disabled={isSaving} onClick={onAddAlias} />
            {hasChanges && <ResetButton disabled={isSaving} onClick={resetKey} />}
          </>
        )}
        <SaveButton
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
