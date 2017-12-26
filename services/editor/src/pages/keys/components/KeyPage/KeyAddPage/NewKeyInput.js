import React from 'react';
import * as R from 'ramda';
import { connect } from 'react-redux';
import { Observable } from 'rxjs';
import { compose, mapPropsStream, lifecycle } from 'recompose';
import * as SearchService from '../../../../../services/search-service';
import ComboBox from '../../../../../components/common/ComboBox/ComboBox';
import ValidationIcon from '../../../../../components/common/ValidationIcon';
import keyNameValidations from './key-name-validations';
import './NewKeyInput.css';

const getKeyPrefix = path => R.slice(0, -1, path.split('/')).join('/');
const getSugesstions = R.pipe(R.map(getKeyPrefix), R.uniq(), R.filter(x => x !== ''));

function getKeyNameSuggestions(keysList) {
  return getSugesstions(keysList).sort();
}

const NewKeyInput = compose(
  connect(state => ({ keysList: state.keys })),
  mapPropsStream(prop$ => {
    const keysList$ = prop$
      .pluck('keysList')
      .distinctUntilChanged()
      .switchMap(SearchService.filterInternalKeys);

    return Observable.combineLatest(prop$, keysList$, (props, keysList) => ({
      ...props,
      keysList,
    }));
  }),
  lifecycle({
    componentWillMount() {
      const { displayName, keysList, onChange } = this.props;
      let validation = keyNameValidations(displayName, keysList);
      validation.isShowingHint = false;
      onChange(displayName, validation);
    },
  }),
)(({ keysList, validation: { isShowingHint = false, hint } = {}, onChange, displayName }) => {
  const suggestions = getKeyNameSuggestions(keysList).map(x => ({ label: x, value: x }));
  return (
    <div className="keypath-input-wrapper">
      <div
        data-comp="new-key-name"
        className="keypath-input-container"
        data-with-error={isShowingHint}
      >
        <ValidationIcon show={isShowingHint} hint={hint} />
        <ComboBox
          data-field="new-key-name-input"
          suggestions={suggestions}
          value={displayName}
          placeholder="Enter key full path"
          onChange={text => {
            const validation = keyNameValidations(text, keysList);
            validation.isShowingHint = !validation.isValid;
            onChange(text, validation);
          }}
          showValueInOptions
        />
      </div>
    </div>
  );
});

NewKeyInput.displayName = 'NewKeyInput';

export default NewKeyInput;
