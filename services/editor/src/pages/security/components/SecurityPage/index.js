import React from 'react';
import {
  compose,
  withState,
  mapPropsStream,
  withProps,
  withHandlers,
  branch,
  setDisplayName,
} from 'recompose';
import Rx from 'rxjs';
import { getPolicies, putPolicies } from '../../../../store/ducks/policies';
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
];

const mapDisplayPoliciesToPolicies = displayPolicies => ({ policies: displayPolicies });

const mapPoliciesToDisplayPolicies = policies => policies.policies;

const SecurityPage = ({ fetchedPolicies, displayPolicies, onSave }) => {
  if (fetchedPolicies.value) {
    return (
      <div className="security-page">
        <PoliciesEditor policies={displayPolicies} onSave={onSave} />
      </div>
    );
  } else if (fetchedPolicies.error) {
    return (
      <div className="security-page">
        <div className="unauthorized">Unable to view or edit security rules</div>
      </div>
    );
  } else {
    return (
      <div className="security-page">
        <div className="fetching-policies">Fetching policies...</div>
      </div>
    );
  }
};

const resolvePolicies = compose(
  mapPropsStream((props$) => {
    const policies$ = props$
      .flatMap(() => {
        const policiesPromise = getPolicies();
        const currentValue = Rx.Observable.of({ value: null, error: null });
        const futureValue = Rx.Observable.fromPromise(
          policiesPromise.then(
            value => ({ value, error: null }),
            error => ({ error, value: null }),
          ),
        );
        return Rx.Observable.of(currentValue, futureValue);
      })
      .switch();

    return props$.combineLatest(policies$, (props, fetchedPolicies) => ({
      ...props,
      fetchedPolicies,
    }));
  }),
);

export default compose(
  resolvePolicies,
  branch(
    ({ fetchedPolicies }) => fetchedPolicies.value,
    compose(
      withProps(({ fetchedPolicies }) => ({
        displayPolicies: mapPoliciesToDisplayPolicies(fetchedPolicies.value),
      })),
      withHandlers({
        onSave: () => displayPolicies => putPolicies(mapDisplayPoliciesToPolicies(displayPolicies)),
      }),
    ),
  ),
)(SecurityPage);
