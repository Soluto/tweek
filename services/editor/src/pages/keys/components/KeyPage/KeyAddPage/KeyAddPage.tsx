import React from 'react';
import { connect } from 'react-redux';
import { KeyManifest } from 'tweek-client';
import {
  addKeyDetails,
  changeKeyFormat,
  changeKeyValueType,
  updateKeyPath,
} from '../../../../../store/ducks/selectedKey';
import { KeyActions, SelectedKey, StoreState } from '../../../../../store/ducks/types';
import './KeyAddPage.css';
import KeyFormatSelector from './KeyFormatSelector';
import KeyValueTypeSelector from './KeyValueTypeSelector/KeyValueTypeSelector';
import NewKeyInput from './NewKeyInput';

type Actions = Pick<
  KeyActions,
  'addKeyDetails' | 'updateKeyPath' | 'changeKeyFormat' | 'changeKeyValueType'
>;

type StateProps = {
  manifest: KeyManifest;
  validation: SelectedKey['validation'];
};

const enhance = connect<StateProps, Actions, {}, StoreState>(
  (state) => ({
    manifest: state.selectedKey!.local.manifest,
    validation: state.selectedKey!.validation,
  }),
  {
    addKeyDetails,
    updateKeyPath,
    changeKeyFormat,
    changeKeyValueType,
  },
);

export type KeyAddPageProps = Actions & StateProps;

const KeyAddPage = ({
  manifest,
  updateKeyPath,
  addKeyDetails,
  changeKeyFormat,
  changeKeyValueType,
  validation,
}: KeyAddPageProps) => {
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

export default enhance(KeyAddPage);
