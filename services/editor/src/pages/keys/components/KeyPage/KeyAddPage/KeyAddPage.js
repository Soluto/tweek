import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import {
  addKeyDetails,
  changeKeyFormat,
  updateKeyPath,
} from '../../../../../store/ducks/selectedKey';
import './KeyAddPage.css';
import KeyFormatSelector from './KeyFormatSelector';
import KeyValueTypeSelector from './KeyValueTypeSelector/KeyValueTypeSelector';
import NewKeyInput from './NewKeyInput';

const enhance = connect(
  ({
    selectedKey: {
      local: { manifest },
      validation: { key: keyValidation },
    },
  }) => ({
    manifest,
    keyValidation,
  }),
  {
    addKeyDetails,
    updateKeyPath,
    changeKeyFormat,
  },
);

const KeyAddPage = ({ manifest, updateKeyPath, addKeyDetails, changeKeyFormat, keyValidation }) => {
  const valueType = manifest.valueType;
  const displayName = manifest.meta.name;
  return (
    <div id="add-key-page" className="add-key-page" data-comp="add-key-page">
      <h3 className="heading-text">Add new Key</h3>
      <div className="add-key-input-wrapper">
        <label className="keypath-label">Keypath:</label>
        <NewKeyInput
          onChange={updateKeyPath}
          displayName={displayName}
          validation={keyValidation}
        />
      </div>
      <div className="add-key-properties-wrapper">
        <KeyFormatSelector onFormatChanged={changeKeyFormat} />
        <div className="hspace" />
        <KeyValueTypeSelector value={valueType} />
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

KeyAddPage.propTypes = {
  updateKeyPath: PropTypes.func.isRequired,
  addKeyDetails: PropTypes.func.isRequired,
  changeKeyFormat: PropTypes.func.isRequired,
  manifest: PropTypes.object.isRequired,
};

export default enhance(KeyAddPage);
