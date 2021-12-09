import React, { useEffect, useState } from 'react';
import { KeyManifest } from 'tweek-client';
import { createBlankKeyManifest } from '../../../../../contexts/SelectedKey/blankKeyDefinition';
import { useKeyPathValidation, Validation } from './key-name-validations';
import KeyFormatSelector from './KeyFormatSelector';
import KeyValueTypeSelector from './KeyValueTypeSelector/KeyValueTypeSelector';
import NewKeyInput from './NewKeyInput';

export type KeyManifestPageProps = {
  hint?: string;
  onContinue: (manifest: KeyManifest) => void;
};

const KeyManifestPage = ({ hint, onContinue }: KeyManifestPageProps) => {
  const [manifest, setManifest] = useState<KeyManifest>(
    createBlankKeyManifest(hint) as KeyManifest,
  );

  useEffect(() => {
    if (manifest.key_path !== hint) {
      setManifest(createBlankKeyManifest(hint) as KeyManifest);
    }
  }, [hint]); //eslint-disable-line react-hooks/exhaustive-deps

  const validateKeyPath = useKeyPathValidation();
  const [validation, setValidation] = useState<Validation>();

  return (
    <div id="add-key-page" className="add-key-page" data-comp="add-key-page">
      <h3 className="heading-text">Add new Key</h3>
      <div className="add-key-input-wrapper">
        <label className="keypath-label">Keypath:</label>
        <NewKeyInput
          onChange={(keyPath) => {
            setManifest((m) => ({ ...m, key_path: keyPath, meta: { ...m.meta, name: keyPath } }));
            setValidation(validateKeyPath(keyPath));
          }}
          validation={validation}
          keyPath={manifest.key_path}
        />
      </div>
      <div className="add-key-properties-wrapper">
        <KeyFormatSelector
          onFormatChanged={(implementation) => setManifest((m) => ({ ...m, implementation }))}
        />
        <div className="hspace" />
        <KeyValueTypeSelector
          value={manifest.valueType}
          onChange={(valueType) => setManifest((m) => ({ ...m, valueType }))}
        />
      </div>
      <div className="vspace" />
      <div className="add-key-button-wrapper">
        <button
          className="add-key-button"
          data-comp="add-key-button"
          onClick={() => {
            const currentValidation = validation || validateKeyPath(manifest.key_path);
            if (currentValidation.isValid) {
              onContinue(manifest);
            } else if (!validation) {
              setValidation(currentValidation);
            }
          }}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default KeyManifestPage;
