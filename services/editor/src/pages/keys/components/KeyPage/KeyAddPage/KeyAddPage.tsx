import React from 'react';
import { useSelectedKetActions, useSelectedKey } from '../../../../../contexts/SelectedKey';
import { useKeyPathValidation } from './key-name-validations';
import './KeyAddPage.css';
import KeyFormatSelector from './KeyFormatSelector';
import KeyValueTypeSelector from './KeyValueTypeSelector/KeyValueTypeSelector';
import NewKeyInput from './NewKeyInput';

const KeyAddPage = () => {
  const {
    addKeyDetails,
    updateKeyPath,
    changeKeyFormat,
    changeKeyValueType,
  } = useSelectedKetActions();

  const {
    local: { manifest },
    validation,
  } = useSelectedKey()!;

  const validateKey = useKeyPathValidation();

  const valueType = manifest.valueType;
  const displayName = manifest.key_path;

  return (
    <div id="add-key-page" className="add-key-page" data-comp="add-key-page">
      <h3 className="heading-text">Add new Key</h3>
      <div className="add-key-input-wrapper">
        <label className="keypath-label">Keypath:</label>
        <NewKeyInput
          onChange={(keyPath) => updateKeyPath(keyPath, validateKey(keyPath))}
          keyPath={displayName}
          validation={validation.key}
        />
      </div>
      <div className="add-key-properties-wrapper">
        <KeyFormatSelector onFormatChanged={changeKeyFormat} />
        <div className="hspace" />
        <KeyValueTypeSelector
          value={valueType}
          validation={validation.manifest?.valueType}
          onChange={changeKeyValueType}
        />
      </div>
      <div className="vspace" />
      <div className="add-key-button-wrapper">
        <button className="add-key-button" data-comp="add-key-button" onClick={addKeyDetails}>
          Continue
        </button>
      </div>
    </div>
  );
};

export default KeyAddPage;
