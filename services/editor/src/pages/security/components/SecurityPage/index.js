import React from 'react';
import 'jsoneditor-react/es/editor.min.css';
import { compose, withState, mapPropsStream, withProps, withHandlers, branch, setDisplayName } from 'recompose';
import { getPolicies, putPolicies } from '../../../../store/ducks/policies';
import Rx from 'rxjs';
import './index.css';
import PoliciesEditor from './PoliciesEditor';

const objects = [
	'values',
	'context',
	'keys',
	'tags',
	'schemas',
	'manifests',
	'suggestions',
	'search',
	'dependents',
	'revision-history',
	'policies',
	'apps',
	'repo',
	'*',
]

const mapDisplayPoliciesToPolicies = (displayPolicies) => {
	const policies = []
	Object.keys(displayPolicies).forEach(policyType => {
		const policyTypePaths = displayPolicies[policyType]

		Object.keys(policyTypePaths).forEach(policyTypePath => {
			const policyArray = policyTypePaths[policyTypePath]
			policyArray.forEach(policy => {
				policies.push(policy)
			})
		})
	})

	return {policies}
}

const mapPoliciesToDisplayPolicies = (policies) => {
	const policyArray = policies.policies
	const displayPolicies = {}

	for (let i = 0; i < objects.length; i++) {
		displayPolicies[objects[i]] = {}
	}

	for (let i = 0; i < policyArray.length; i++) {
		const currentPolicy = policyArray[i]
		const currentObject = currentPolicy.object
		const objectType = currentObject.split('.')[0].split('/')[0]
		if (displayPolicies[objectType]) {
			const objectTypePaths = displayPolicies[objectType]
			if (!objectTypePaths[currentObject]) {
				objectTypePaths[currentObject] = []	
			}

			objectTypePaths[currentObject].push(currentPolicy)
		}
	}

	return displayPolicies
}

const SecurityPage = ({fetchedPolicies, displayPolicies, onSave}) => {
	if (fetchedPolicies.value) {
		return (
			<div className="security-page">
				<PoliciesEditor policies={displayPolicies} onSave={onSave} />
			</div>
		)
	} else if (fetchedPolicies.error) {
		return (
			<div className="security-page">
				<div className="unauthorized">
					Unable to view or edit security rules
				</div>
			</div> 
		)
	} else {
		return (
			<div className="security-page">
				<div className="fetching-policies">
					Fetching policies...
				</div>
			</div>  
		)
	}
}
		

const resolvePolicies = compose(
  mapPropsStream((props$) => {
    const policies$ = props$
      .flatMap(() => {
        const policiesPromise = getPolicies()
        const currentValue = Rx.Observable.of({value: null, error: null})
        const futureValue = Rx.Observable.fromPromise(policiesPromise.then(
          value => ({value, error: null}),
          error => ({error, value: null}),
        ))
        return Rx.Observable.of(currentValue, futureValue)
      })
      .switch()

    return props$
      .combineLatest(policies$, (props, fetchedPolicies) => ({...props, fetchedPolicies}))
  })
)

export default compose (
	resolvePolicies,
	branch(({fetchedPolicies}) => fetchedPolicies.value,
		compose(
			withProps(({fetchedPolicies}) => ({
				displayPolicies: mapPoliciesToDisplayPolicies(fetchedPolicies.value)
			})),
			withHandlers({
				onSave: () => (displayPolicies) => putPolicies(mapDisplayPoliciesToPolicies(displayPolicies)),
			})
		)
	),
)(SecurityPage);