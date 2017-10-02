import React from 'react';
import { compose, setDisplayName, setPropTypes } from 'recompose';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import KeyValueTypeSelector from '../KeyEditPage/KeyValueTypeSelector/KeyValueTypeSelector';
import NewKeyInput from '../KeyEditPage/NewKeyInput';
import { addKeyDetails, updateKeyPath, changeKeyFormat } from '../../../../../store/ducks/selectedKey';
import KeyFormatSelector from './KeyFormatSelector';
import './KeyAddPage.css';

const KeyAddPage = compose(
  connect((state => ({ manifest: state.selectedKey.local.manifest })),
    { addKeyDetails, updateKeyPath, changeKeyFormat }
  ),
  setDisplayName('KeyAddPage'),
  setPropTypes({
    updateKeyPath: PropTypes.func.isRequired,
    addKeyDetails: PropTypes.func.isRequired,
    changeKeyFormat: PropTypes.func.isRequired,
    manifest: PropTypes.object.isRequired,
  }),
)(({ manifest, updateKeyPath, addKeyDetails, changeKeyFormat }) => {
  const valueType = manifest.valueType;
  const displayName = manifest.meta.name;
  return (
    <div id="add-key-page" className="add-key-page" data-comp="add-key-page">
      <h3 className="heading-text">Add new Key</h3>
      <div className="add-key-input-wrapper">
        <label className="keypath-label">Keypath:</label>
        <div className="keypath-input">
          <NewKeyInput onKeyNameChanged={name => updateKeyPath(name)} displayName={displayName} />
        </div>
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
});

export default KeyAddPage;
