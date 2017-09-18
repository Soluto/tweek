import React from 'react';
import { compose, setDisplayName, setPropTypes } from 'recompose';
import PropTypes from 'prop-types';
import KeyValueTypeSelector from '../KeyEditPage/KeyValueTypeSelector/KeyValueTypeSelector';
import NewKeyInput from '../KeyEditPage/NewKeyInput';
import KeyFormatSelector from './KeyFormatSelector';

const KeyAddPage = compose(
  setDisplayName('KeyAddPage'),
  setPropTypes({
    updateKeyPath: PropTypes.func.isRequired,
    addKeyDetails: PropTypes.func.isRequired,
    changeKeyFormat: PropTypes.func.isRequired,
    manifest: PropTypes.object.isRequired,
    validation: PropTypes.object.isRequired,
  }),
)(({ manifest, updateKeyPath, addKeyDetails, changeKeyFormat, validation }) => {
  const valueType = manifest.valueType;
  const displayName = manifest.meta.name;
  const format =
    manifest.implementation.type === 'file'
      ? manifest.implementation.format
      : manifest.implementation.type;
  return (
    <div>
      <h1>Add new Key</h1>
      <div className="new-key-input-wrapper">
        <NewKeyInput onKeyNameChanged={name => updateKeyPath(name)} displayName={displayName} />
        <KeyValueTypeSelector value={valueType} />
        <KeyFormatSelector
          format={format}
          onFormatChanged={changeKeyFormat}
          validation={validation.format}
        />
      </div>
      <button className="add-key-button" data-comp="add-key-button" onClick={addKeyDetails}>
        Add key
      </button>
    </div>
  );
});

export default KeyAddPage;
