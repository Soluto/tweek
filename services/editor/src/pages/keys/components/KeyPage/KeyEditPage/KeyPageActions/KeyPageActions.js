import React from 'react';
import { connect } from 'react-redux';
import { compose, mapProps, withHandlers } from 'recompose';
import * as R from 'ramda';
import * as keysActions from '../../../../../../store/ducks/selectedKey';
import { showCustomAlert, buttons } from '../../../../../../store/ducks/alerts';
import { withTweekKeys } from '../../../../../../contexts/Tweek';
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

const enhance = compose(
  connect(state => ({ selectedKey: state.selectedKey, isValid: R.path(validationPath, state) }), {
    ...keysActions,
    showCustomAlert,
  }),
  withTweekKeys({ historySince: '@tweek/editor/history/since' }),
  withHandlers({
    addAlias: ({ selectedKey: { key }, addAlias, showCustomAlert }) => async () => {
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
    onArchiveKey: ({ archiveKey, historySince }) => () => archiveKey(true, historySince),
    onUnarchiveKey: ({ archiveKey, historySince }) => () => archiveKey(false, historySince),
    saveKey: ({ saveKey, historySince }) => () => saveKey(historySince),
  }),
  mapProps(({ selectedKey: { local, remote, isSaving }, isInStickyMode, ...props }) => ({
    ...props,
    hasChanges: !R.equals(local, remote),
    isSaving,
    extraButtons: !isInStickyMode,
    archived: local && local.manifest.meta.archived,
  })),
);

const KeyPageActions = ({
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
  onArchiveKey,
  onUnarchiveKey,
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
          <UnarchiveButton disabled={isSaving} onClick={onUnarchiveKey} />
        ) : (
          <ArchiveButton disabled={isSaving} onClick={onArchiveKey} />
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
);

export default enhance(KeyPageActions);
