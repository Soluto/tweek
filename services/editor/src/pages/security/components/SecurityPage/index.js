import React from 'react';
import { JsonEditor as Editor } from 'jsoneditor-react';
import 'jsoneditor-react/es/editor.min.css';
import { compose, withState, mapPropsStream, withProps, withHandlers } from 'recompose';
import { getPolicies, putPolicies } from '../../../../store/ducks/policies';
import Rx from 'rxjs';
import './index.css';
import SaveButton from '../../../../components/common/SaveButton/SaveButton';
 
const SecurityPage = ({policies, unsavedPolicies, onEdit, onSave, isSavingChanges}) => 
	<div className="security-page">
		<div className="action-bar">
			<SaveButton 
				data-comp="save-button"
				hasChanges={unsavedPolicies != policies}
				isSaving={isSavingChanges}
				onClick={onSave}
			/>
		</div>
		<Editor
			value={policies}
			onChange={onEdit}						
		/>
	</div>

const resolvePromise = (key) => compose(
  mapPropsStream((props$) => {
    const value$ = props$
      .distinctUntilKeyChanged(key)
      .flatMap(props => {
				const value = props[key];
				const futureValue = Rx.Observable.fromPromise(value);
        return futureValue;
      })

    return props$
			.combineLatest(value$, (props, value) => ({...props, [key]: value}));
	})
)

export default compose (
	withProps(() => ({
		originalPolicies: getPolicies(),
	})),
	resolvePromise('originalPolicies'),
	withState('policies', 'updatePolicies', props => props.originalPolicies),
	withState('unsavedPolicies', 'updateUnsavedPolicies', props => props.policies),
	withState('isSavingChanges', 'updateIsSavingChanges', false),
	withHandlers({
		onSave: ({updatePolicies, unsavedPolicies, updateIsSavingChanges}) => async () => {
			updateIsSavingChanges(true);
			updatePolicies(unsavedPolicies);
			await putPolicies(unsavedPolicies);
			updateIsSavingChanges(false);
		},
		onEdit: ({updateUnsavedPolicies}) => newPolicies => updateUnsavedPolicies(newPolicies)
	})
)(SecurityPage);