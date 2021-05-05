import { uniq } from 'ramda';
import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { KeyManifest } from 'tweek-client';
import { ComboBox, ValidationIcon } from '../../../../../components/common';
import * as SearchService from '../../../../../services/search-service';
import { useShowInternalKeys } from '../../../../../utils';
import keyNameValidations, { KeyNameValidationResult } from './key-name-validations';
import './NewKeyInput.css';

const getKeyPrefix = (path: string) => path.split('/').slice(0, -1).join('/');

function getKeyNameSuggestions(allKeys: Record<string, KeyManifest>, showInternalKeys: boolean) {
  const keys = SearchService.filterInternalKeys(allKeys, showInternalKeys);

  const suggestions = Object.entries(keys)
    .filter(([_, k]) => !k.meta.archived)
    .map(([p]) => getKeyPrefix(p))
    .filter(Boolean);

  return uniq(suggestions).sort();
}

type State = { keys: Record<string, KeyManifest> };

const enhance = connect((state: State) => ({ keys: state.keys }));

export type NewKeyInputProps = State & {
  validation?: { isShowingHint?: boolean; hint?: string };
  displayName: string;
  onChange: (keyName: string, validation: KeyNameValidationResult) => void;
};

const NewKeyInput = ({
  keys,
  validation: { isShowingHint = false, hint } = {},
  onChange,
  displayName,
}: NewKeyInputProps) => {
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
