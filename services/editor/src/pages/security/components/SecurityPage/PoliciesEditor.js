import React from 'react';
import { compose, withState, withHandlers } from 'recompose';
import SaveButton from '../../../../components/common/SaveButton/SaveButton';
import EditableTable from './EditableTable';
import './index.css';

const PoliciesEditor = ({
  savedPolicies,
  onSave,
  isSaving,
  unsavedPolicies,
  onEdit,
  onAddPolicy,
}) => (
  <div>
    <div className="action-bar">
      <SaveButton
        data-comp="save-button"
        hasChanges={unsavedPolicies != savedPolicies}
        isSaving={isSaving}
        onClick={onSave}
      />
      <button className="add-policy-button" data-comp="add-policy" onClick={onAddPolicy}>
        Add Policy
      </button>
    </div>
    <EditableTable
      data={unsavedPolicies}
      onEditTable={onEdit}
      columns={{
        user: 'string',
        group: 'string',
        contexts: 'json',
        object: 'string',
        action: 'string',
        effect: 'yes-or-no',
      }}
    />
  </div>
);

export default compose(
  withState('savedPolicies', 'updateSavedPolicies', props => props.policies),
  withState('unsavedPolicies', 'updateUnsavedPolicies', props => props.policies),
  withState('isSaving', 'updateIsSaving', false),
  withHandlers({
    onEdit: ({ updateUnsavedPolicies }) => newPolicies =>
      updateUnsavedPolicies([...newPolicies.map(policy => ({ ...policy }))]),
    onSave: ({ updateIsSaving, updateSavedPolicies, onSave, unsavedPolicies }) => async () => {
      updateIsSaving(true);
      await onSave(unsavedPolicies);
      updateSavedPolicies(unsavedPolicies);
      updateIsSaving(false);
    },
  }),
  withHandlers({
    onAddPolicy: ({ onEdit, unsavedPolicies }) => () =>
      onEdit([
        { user: '', group: '', contexts: {}, object: '', action: '', effect: '' },
        ...unsavedPolicies,
      ]),
  }),
)(PoliciesEditor);
