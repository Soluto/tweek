import React from 'react';
import { compose, setDisplayName, setPropTypes } from 'recompose';
import PropTypes from 'prop-types';
import KeyValueTypeSelector from '../KeyEditPage/KeyValueTypeSelector/KeyValueTypeSelector';
import NewKeyInput from '../KeyEditPage/NewKeyInput';
import KeyFormatSelector from './KeyFormatSelector';
import './KeyAddPage.css';

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
    <div id="add-key-page" className="add-key-page" data-comp="add-key-page">
      <h3 className="heading-text">Add new Key</h3>
      <div className="add-key-input-wrapper">
        <label className="keypath-label">Keypath</label>
        <div className="keypath-input">
          <NewKeyInput onKeyNameChanged={name => updateKeyPath(name)} displayName={displayName} />
        </div>
      </div>
      <div className="add-key-properties-wrapper">
        <KeyValueTypeSelector value={valueType} />
        <KeyFormatSelector
          format={format}
          onFormatChanged={changeKeyFormat}
          validation={validation.format}
        />
      </div>
      <div className="add-key-spacer" />
      <div className="add-key-button-wrapper">
        <button className="add-key-button" data-comp="add-key-button" onClick={addKeyDetails}>
          Add key
        </button>
      </div>
    </div>
  );
});

export default KeyAddPage;
