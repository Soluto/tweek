import * as R from 'ramda';
import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { ComboBox, ValidationIcon } from '../../../../../components/common';
import { useShowInternalKeys } from '../../../../../hoc/with-search-config';
import * as SearchService from '../../../../../services/search-service';
import keyNameValidations from './key-name-validations';
import './NewKeyInput.css';

const getKeyPrefix = (path) => R.slice(0, -1, path.split('/')).join('/');
const getSugesstions = R.pipe(
  R.filter((key) => !key.meta.archived),
  R.keys(),
  R.map(getKeyPrefix),
  R.uniq(),
  R.filter((x) => x !== ''),
);

function getKeyNameSuggestions(allKeys, showInternalKeys) {
  const keys = SearchService.filterInternalKeys(allKeys, showInternalKeys);
  return getSugesstions(keys).sort();
}

const enhance = connect((state) => ({ keys: state.keys }));

const NewKeyInput = ({
  keys,
  validation: { isShowingHint = false, hint } = {},
  onChange,
  displayName,
}) => {
  const showInternalKeys = useShowInternalKeys();
  const keysNames = Object.keys(keys);

  useEffect(() => {
    const validation = keyNameValidations(displayName, keysNames);
    validation.isShowingHint = false;
    onChange(displayName, validation);
  }, []); //eslint-disable-line react-hooks/exhaustive-deps

  const suggestions = getKeyNameSuggestions(keys, showInternalKeys).map((x) => ({
    label: x,
    value: x,
  }));

  return (
    <div className="keypath-input-wrapper">
      <div
        data-comp="new-key-name"
        className="keypath-input-container"
        data-with-error={isShowingHint}
      >
        <ValidationIcon show={isShowingHint} hint={hint} />
        <ComboBox
          autofocus
          data-field="new-key-name-input"
          suggestions={suggestions}
          value={displayName}
          placeholder="Enter key full path"
          onChange={(text) => {
            const validation = keyNameValidations(text, keysNames);
            validation.isShowingHint = !validation.isValid;
            onChange(text, validation);
          }}
          showValueInOptions
        />
      </div>
    </div>
  );
};

export default enhance(NewKeyInput);
