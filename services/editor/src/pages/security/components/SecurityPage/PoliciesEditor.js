import React from 'react';
import { JsonEditor as Editor } from 'jsoneditor-react';
import SaveButton from '../../../../components/common/SaveButton/SaveButton';
import {compose, withState, withHandlers} from 'recompose';
import './index.css';

const PoliciesEditor = ({savedPolicies, onSave, isSaving, unsavedPolicies, onEdit}) => 
	<div>
		<div className="action-bar">
			<SaveButton 
				data-comp="save-button"
				hasChanges={unsavedPolicies != savedPolicies}
				isSaving={isSaving}
				onClick={onSave}
			/>
		</div>
		<Editor
			value={savedPolicies}
			onChange={onEdit}						
		/>
	</div>

export default compose(
	withState('savedPolicies', 'updateSavedPolicies', props => props.policies),
	withState('unsavedPolicies', 'updateUnsavedPolicies', props => props.policies),
	withState('isSaving', 'updateIsSaving', false),
	withHandlers({
		onEdit: ({updateUnsavedPolicies}) => newPolicies => updateUnsavedPolicies(newPolicies),
		onSave: ({updateIsSaving, updateSavedPolicies, onSave, unsavedPolicies}) => async () => {
			updateIsSaving(true);
			await onSave(unsavedPolicies);
			updateSavedPolicies(unsavedPolicies);
			updateIsSaving(false);
		}
	}),
)(PoliciesEditor)