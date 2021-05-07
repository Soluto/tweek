import { uniq } from 'ramda';
import React from 'react';
import { connect } from 'react-redux';
import { KeyManifest } from 'tweek-client';
import { ComboBox, ValidationIcon } from '../../../../../components/common';
import * as SearchService from '../../../../../services/search-service';
import { Validation } from '../../../../../store/ducks/types';
import { useShowInternalKeys } from '../../../../../utils';
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
  validation?: Validation;
  keyPath: string;
  onChange: (keyPath: string) => void;
};

const NewKeyInput = ({
  keys,
  validation: { isValid, hint } = { isValid: true },
  onChange,
  keyPath,
}: NewKeyInputProps) => {
  const showInternalKeys = useShowInternalKeys();

  const suggestions = getKeyNameSuggestions(keys, showInternalKeys).map((x) => ({
    label: x,
    value: x,
  }));

  return (
    <div className="keypath-input-wrapper">
      <div data-comp="new-key-name" className="keypath-input-container" data-with-error={!isValid}>
        <ValidationIcon show={!isValid} hint={hint} />
        <ComboBox
          autofocus
          data-field="new-key-name-input"
          suggestions={suggestions}
          value={keyPath}
          placeholder="Enter key full path"
          onChange={onChange}
          showValueInOptions
        />
      </div>
    </div>
  );
};

export default enhance(NewKeyInput);
