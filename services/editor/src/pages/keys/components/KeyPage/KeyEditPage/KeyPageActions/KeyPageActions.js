import React from 'react';
import { connect } from 'react-redux';
import { compose, mapProps } from 'recompose';
import * as R from 'ramda';
import * as keysActions from '../../../../../../store/ducks/selectedKey';
import { showCustomAlert, buttons } from '../../../../../../store/ducks/alerts';
import SaveButton from '../../../../../../components/common/SaveButton/SaveButton';
import NewKeyInput from '../../KeyAddPage/NewKeyInput';
import archiveIcon from '../../../../../../resources/archive-icon.svg';
import restoreIcon from '../../../../../../resources/restore-icon.svg';
import trashIcon from '../../../../../../resources/trash-icon.svg';
import linkIcon from '../../../../../../resources/link-icon.svg';
import './KeyPageActions.css';

const iconButton = ({ image, text, dataComp }) => props => (
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

const validationPath = ['selectedKey', 'validation', 'isValid'];

const KeyPageActions = compose(
  connect(state => ({ selectedKey: state.selectedKey, isValid: R.path(validationPath, state) }), {
    ...keysActions,
    showCustomAlert,
  }),
  mapProps(
    ({
      selectedKey: { key, local, remote, isSaving },
      isInStickyMode,
      addAlias,
      showCustomAlert,
      ...props
    }) => ({
      ...props,
      hasChanges: !R.equals(local, remote),
      isSaving,
      extraButtons: !isInStickyMode,
      archived: local && local.manifest.meta.archived,
      addAlias: async () => {
        const component = mapProps(
          ({ onChange, componentData: { displayName = '', validation = {} } = {} }) => ({
            onChange: (newName, newValidation) =>
              onChange({ displayName: newName, validation: newValidation }),
            displayName,
            validation,
          }),
        )(NewKeyInput);

        const okButton = {
          ...buttons.OK,
          validate: data => data && data.validation.isValid,
        };

        const alert = {
          title: `Add alias for ${key}`,
          message: 'Insert a new alias',
          component,
          buttons: [okButton, buttons.CANCEL],
        };

        const alertResult = await showCustomAlert(alert);
        if (alertResult.result && alertResult.data.validation.isValid) {
          addAlias(alertResult.data.displayName);
        }
      },
    }),
  ),
)(
  ({
    saveKey,
    deleteKey,
    addAlias,
    isReadonly,
    isHistoricRevision,
    hasChanges,
    isSaving,
    isValid,
    extraButtons,
    archived,
    archiveKey,
  }) => (
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
            <UnarchiveButton disabled={isSaving} onClick={() => archiveKey(false)} />
          ) : (
            <ArchiveButton disabled={isSaving} onClick={() => archiveKey(true)} />
          ))}
        {extraButtons && <AddAliasButton disabled={isSaving} onClick={addAlias} />}
        <SaveButton
          {...{ isValid, isSaving, hasChanges }}
          tabIndex="-1"
          data-comp="save-changes"
          onClick={saveKey}
        />
      </div>
    </div>
  ),
);

KeyPageActions.displayName = 'KeyPageActions';

export default KeyPageActions;
