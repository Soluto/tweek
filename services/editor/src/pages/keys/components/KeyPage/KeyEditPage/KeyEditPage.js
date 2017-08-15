import React, { Component } from 'react';
import { compose, pure } from 'recompose';
import { connect } from 'react-redux';
import R from 'ramda';
import Json from 'react-json';
import classNames from 'classnames';
import ReactTooltip from 'react-tooltip';
import ComboBox from '../../../../../components/common/ComboBox/ComboBox';
import TypedInput from '../../../../../components/common/Input/TypedInput';
import JPadFullEditor from '../../../../../components/JPadFullEditor/JPadFullEditor';
import stickyHeaderIdentifier from '../../../../../hoc/sticky-header-identifier';
import KeyTags from './KeyTags/KeyTags';
import EditableText from './EditableText/EditableText';
import EditableTextArea from './EditableTextArea/EditableTextArea';
import RevisionHistory from './RevisionHistory/RevisionHistory';
import KeyPageActions from './KeyPageActions/KeyPageActions';
import alertIconSrc from './resources/alert-icon.svg';
import KeyValueTypeSelector from './KeyValueTypeSelector/KeyValueTypeSelector';
import { UsedBy, DependsOn } from './DependencyIndicator/DependencyIndicator';
import './KeyEditPage.css';

const ConstEditor = ({ value, valueType, onChange }) =>
  <div data-comp="const-editor">
    {valueType === 'object'
      ? <Json value={value} onChange={onChange} />
      : <TypedInput {...{ value, valueType, onChange }} />}
  </div>;

const Editor = ({
  keyPath,
  manifest,
  sourceFile,
  onManifestChange,
  onSourceFileChange,
  onDependencyChanged,
  isReadonly,
  alerter,
}) => {
  if (manifest.implementation.type === 'file') {
    let FileEditor = null;
    if (manifest.implementation.format === 'jpad') {
      FileEditor = JPadFullEditor;
    }
    return (
      <FileEditor
        keyPath={keyPath}
        alerter={alerter}
        source={sourceFile}
        onChange={onSourceFileChange}
        dependencies={manifest.dependencies}
        onDependencyChanged={onDependencyChanged}
        isReadonly={isReadonly}
        valueType={manifest.valueType}
      />
    );
  }
  if (manifest.implementation.type === 'const') {
    return (
      <ConstEditor
        value={manifest.implementation.value}
        valueType={manifest.valueType}
        onChange={value =>
          onManifestChange({ ...manifest, implementation: { ...manifest.implementation, value } })}
      />
    );
  }
  return null;
};

class KeyEditPage extends Component {
  onTagsChanged(newTags) {
    const oldManifest = this.props.selectedKey.local.manifest;
    const newManifest = {
      ...oldManifest,
      meta: {
        ...oldManifest.meta,
        tags: newTags,
      },
    };
    this.onSelectedKeyManifestChanged(newManifest);
  }

  onKeyNameChanged = (newKeyName) => {
    this.props.updateKeyName(newKeyName);
  };

  onDisplayNameChanged = (newDisplayName) => {
    const oldManifest = this.props.selectedKey.local.manifest;
    const newManifest = {
      ...oldManifest,
      meta: {
        ...oldManifest.meta,
        name: newDisplayName,
      },
    };
    this.onSelectedKeyManifestChanged(newManifest);
  };

  onDescriptionChanged(newDescription) {
    const oldManifest = this.props.selectedKey.local.manifest;
    const newManifest = {
      ...oldManifest,
      meta: {
        ...oldManifest.meta,
        description: newDescription,
      },
    };
    this.onSelectedKeyManifestChanged(newManifest);
  }

  onSelectedKeyManifestChanged = (newManifest) => {
    this.props.updateKeyManifest(newManifest);
  };

  onDependencyChanged = (dependencies) => {
    const oldManifest = this.props.selectedKey.local.manifest;
    const newManifest = {
      ...oldManifest,
      dependencies,
    };
    this.onSelectedKeyManifestChanged(newManifest);
  };

  render() {
    const { selectedKey, isInAddMode, isInStickyMode, alerter, revision } = this.props;
    const { key, local: { manifest, keyDef }, revisionHistory, dependentKeys } = selectedKey;
    const isHistoricRevision = revisionHistory && revision && revisionHistory[0].sha !== revision;
    const isReadonly = manifest.meta.readOnly || manifest.meta.archived || isHistoricRevision;

    const commonHeadersProps = {
      onKeyNameChanged: this.onKeyNameChanged,
      onDisplayNameChanged: this.onDisplayNameChanged,
      isInAddMode,
      isHistoricRevision,
      isReadonly,
      keyManifest: manifest,
    };

    return (
      <div id="key-edit-page" className="key-edit-page" data-comp="key-edit-page">
        <div className="key-viewer-container-fieldset">

          <div className="key-viewer-container">
            {isInStickyMode ? <KeyStickyHeader {...commonHeadersProps} /> : null}
            <KeyFullHeader
              {...commonHeadersProps}
              onDescriptionChanged={text => this.onDescriptionChanged(text)}
              onTagsChanged={newTags => this.onTagsChanged(newTags)}
              revisionHistory={revisionHistory}
              revision={revision}
              keyFullPath={key}
              isInStickyMode={isInStickyMode}
              dependentKeys={dependentKeys}
            />

            <div className={classNames('key-rules-editor', { sticky: isInStickyMode })}>
              <Editor
                keyPath={key}
                manifest={manifest}
                sourceFile={keyDef.source}
                onSourceFileChange={source => this.props.updateKeyDef({ source })}
                onManifestChange={this.onSelectedKeyManifestChanged}
                onDependencyChanged={this.onDependencyChanged}
                isReadonly={isReadonly}
                alerter={alerter}
              />
            </div>
          </div>

        </div>
      </div>
    );
  }
}

export default compose(stickyHeaderIdentifier('key-edit-page', 150), pure)(KeyEditPage);

const KeyStickyHeader = (props) => {
  const { isInAddMode, isReadonly, isHistoricRevision } = props;

  return (
    <div className="sticky-key-header" disabled={isReadonly}>

      <HeaderMainInput {...props} />

      {!isReadonly
        ? <div className="sticky-key-page-action-wrapper">
            <KeyPageActions {...{ isInAddMode, isReadonly, isHistoricRevision }} isInStickyMode />
          </div>
        : null}
    </div>
  );
};

const KeyFullHeader = (props) => {
  const {
    isInAddMode,
    isReadonly,
    revisionHistory,
    keyManifest,
    onDescriptionChanged,
    onTagsChanged,
    keyFullPath,
    revision,
    isHistoricRevision,
    dependentKeys,
  } = props;

  return (
    <div className="key-header">

      <KeyPageActions {...{ isInAddMode, isReadonly, isHistoricRevision }} isInStickyMode={false} />

      <div className="key-meta-container">

        <div className="key-header-and-modification-wrapper">

          <HeaderMainInput {...props} />
          {revisionHistory
            ? <RevisionHistory revision={revision} revisionHistory={revisionHistory} />
            : null}

        </div>

        <fieldset disabled={isReadonly} style={{ border: 'none' }}>

          {!isInAddMode
            ? <div className="key-full-path">
                <label>Full path: </label>
                <label className="actual-path">{keyFullPath}</label>
              </div>
            : null}

          <div className="key-description-and-tags-wrapper">
            <div className="key-description-wrapper">
              <EditableTextArea
                value={keyManifest.meta.description}
                onTextChanged={text => onDescriptionChanged(text)}
                placeHolder="Write key description"
                title="Click to edit description"
                classNames={{ input: 'description-input' }}
                maxLength={400}
              />
              <UsedBy items={dependentKeys} />
              <DependsOn items={keyManifest.dependencies} />
            </div>

            <div className="key-tags-wrapper">
              <KeyTags
                onTagsChanged={newTags => onTagsChanged(newTags)}
                tags={keyManifest.meta.tags || []}
              />
            </div>

          </div>

        </fieldset>

      </div>

    </div>
  );
};

const HeaderMainInput = ({
  isInAddMode,
  onKeyNameChanged,
  onDisplayNameChanged,
  keyManifest: { meta: { name: displayName, archived }, valueType },
  isReadonly,
}) =>
  <div className="key-main-input">
    {isInAddMode
      ? <div className="new-key-input-wrapper">
          <NewKeyInput
            onKeyNameChanged={name => onKeyNameChanged(name)}
            displayName={displayName}
          />
          <div className="vertical-separator" />
          <KeyValueTypeSelector value={valueType} />
        </div>
      : <EditableText
          data-comp="display-name"
          onTextChanged={text => onDisplayNameChanged(text)}
          placeHolder="Enter key display name"
          maxLength={80}
          value={archived ? `ARCHIVED: ${displayName}` : displayName}
          isReadonly={isReadonly}
          classNames={{
            container: 'display-name-container',
            input: 'display-name-input',
            text: 'display-name-text',
            form: 'display-name-form',
          }}
        />}
  </div>;

const getKeyPrefix = path => R.slice(0, -1, path.split('/')).join('/');
const getSugesstions = R.pipe(R.map(getKeyPrefix), R.uniq(), R.filter(x => x !== ''));

function getKeyNameSuggestions(keysList) {
  return getSugesstions(keysList).sort();
}

const NewKeyInput = compose(
  connect(state => ({ keysList: state.keys, keyNameValidation: state.selectedKey.validation.key })),
)(({ keysList, keyNameValidation, onKeyNameChanged, displayName }) => {
  const suggestions = getKeyNameSuggestions(keysList).map(x => ({ label: x, value: x }));
  return (
    <div data-comp="new-key-name" className="auto-suggest-wrapper" data-with-error={keyNameValidation.isShowingHint}>
      <div className="validation-icon-wrapper" data-field="validation" data-is-shown={keyNameValidation.isShowingHint}>
        <img className="validation-icon" data-tip={keyNameValidation.hint} src={alertIconSrc} />
      </div>
      <ComboBox
        data-field="new-key-name-input"
        className="auto-suggest"
        suggestions={suggestions}
        value={displayName}
        placeholder="Enter key full path"
        onChange={text => onKeyNameChanged(text)}
        showValueInOptions
      />
      <ReactTooltip
        disable={!keyNameValidation.isShowingHint}
        effect="solid"
        place="top"
        delayHide={500}
      />
    </div>
  );
});

NewKeyInput.displayName = 'NewKeyInput';
