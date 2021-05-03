import * as R from 'ramda';
import React from 'react';
import { connect } from 'react-redux';
import { useTweekValue } from 'react-tweek';
import { SaveButton } from '../../../../../../components/common';
import archiveIcon from '../../../../../../resources/archive-icon.svg';
import linkIcon from '../../../../../../resources/link-icon.svg';
import restoreIcon from '../../../../../../resources/restore-icon.svg';
import trashIcon from '../../../../../../resources/trash-icon.svg';
import { buttons, showCustomAlert } from '../../../../../../store/ducks';
import * as keysActions from '../../../../../../store/ducks/selectedKey';
import NewKeyInput from '../../KeyAddPage/NewKeyInput';
import './KeyPageActions.css';

const iconButton = ({ image, text, dataComp }) => (props) => (
  <button data-comp={dataComp} className="icon-button" tabIndex="-1" {...props}>
    <img src={image} title={text} alt={text} />
  </button>
);

const DeleteButton = iconButton({ image: trashIcon, text: 'Delete key', dataComp: 'delete-key' });
const ArchiveButton = iconButton({
  image: archiveIcon,
  text: 'Archive key',
  dataComp: 'archive-key',
});
const UnarchiveButton = iconButton({
  image: restoreIcon,
  text: 'Restore key',
  dataComp: 'unarchive-key',
});
const AddAliasButton = iconButton({ image: linkIcon, text: 'Add Alias', dataComp: 'add-alias' });

const AddAliasComponent = ({
  onChange,
  componentData: { displayName = '', validation = {} } = {},
}) => (
  <NewKeyInput
    onChange={(newName, newValidation) =>
      onChange({ displayName: newName, validation: newValidation })
    }
    displayName={displayName}
    validation={validation}
  />
);

const validationPath = ['selectedKey', 'validation', 'isValid'];

const enhance = connect(
  (state) => ({ selectedKey: state.selectedKey, isValid: R.path(validationPath, state) }),
  {
    ...keysActions,
    showCustomAlert,
  },
);

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
  showCustomAlert,
}) => {
  const historySince = useTweekValue('@tweek/editor/history/since', undefined);

  const hasChanges = !R.equals(local, remote);
  const extraButtons = !isInStickyMode;
  const archived = local && local.manifest.meta.archived;

  const onAddAlias = async () => {
    const okButton = {
      ...buttons.OK,
      validate: (data) => data && data.validation.isValid,
    };

    const alert = {
      title: `Add alias for ${key}`,
      message: 'Insert a new alias',
      component: AddAliasComponent,
      buttons: [okButton, buttons.CANCEL],
    };

    const alertResult = await showCustomAlert(alert);
    if (alertResult.result && alertResult.data.validation.isValid) {
      addAlias(alertResult.data.displayName);
    }
  };

  return (
    <div>
      {isReadonly ? (
        <div className="readonly-key-message" data-comp="key-message">
          {isHistoricRevision ? 'This is an old revision of this key' : 'This key is readonly'}
        </div>
      ) : null}
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
          {...{ isValid, isSaving, hasChanges }}
          tabIndex="-1"
          data-comp="save-changes"
          onClick={() => saveKey(historySince)}
        />
      </div>
    </div>
  );
};

export default enhance(KeyPageActions);
