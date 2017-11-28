import React from 'react';
import * as R from 'ramda';
import { connect } from 'react-redux';
import { Observable } from 'rxjs';
import { compose, mapPropsStream } from 'recompose';
import * as SearchService from '../../../../../services/search-service';
import ComboBox from '../../../../../components/common/ComboBox/ComboBox';
import ValidationIcon from '../../../../../components/common/ValidationIcon';

const getKeyPrefix = path => R.slice(0, -1, path.split('/')).join('/');
const getSugesstions = R.pipe(R.map(getKeyPrefix), R.uniq(), R.filter(x => x !== ''));

function getKeyNameSuggestions(keysList) {
  return getSugesstions(keysList).sort();
}

const NewKeyInput = compose(
  connect(state => ({ keysList: state.keys, keyNameValidation: state.selectedKey.validation.key })),
  mapPropsStream((prop$) => {
    const keysList$ = prop$
      .map(x => x.keysList)
      .distinctUntilChanged()
      .switchMap(SearchService.filterInternalKeys);

    return Observable.combineLatest(prop$, keysList$, (props, keysList) => ({
      ...props,
      keysList,
    }));
  }),
)(({ keysList, keyNameValidation, onKeyNameChanged, displayName }) => {
  const suggestions = getKeyNameSuggestions(keysList).map(x => ({ label: x, value: x }));
  return (
    <div
      data-comp="new-key-name"
      className="auto-suggest-wrapper"
      data-with-error={keyNameValidation.isShowingHint}
    >
      <ValidationIcon show={keyNameValidation.isShowingHint} hint={keyNameValidation.hint} />
      <ComboBox
        data-field="new-key-name-input"
        className="auto-suggest"
        suggestions={suggestions}
        value={displayName}
        placeholder="Enter key full path"
        onChange={text => onKeyNameChanged(text)}
        showValueInOptions
      />
    </div>
  );
});

NewKeyInput.displayName = 'NewKeyInput';

export default NewKeyInput;
