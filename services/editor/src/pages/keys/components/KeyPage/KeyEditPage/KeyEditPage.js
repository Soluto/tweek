import React, { Component } from 'react';
import { compose, pure } from 'recompose';
import classNames from 'classnames';
import JPadFullEditor from '../../../../../components/JPadFullEditor/JPadFullEditor';
import stickyHeaderIdentifier from '../../../../../hoc/sticky-header-identifier';
import ConstEditor from '../../../../../components/ConstEditor';
import KeyTags from './KeyTags/KeyTags';
import EditableTextArea from './EditableTextArea/EditableTextArea';
import RevisionHistory from './RevisionHistory/RevisionHistory';
import KeyPageActions from './KeyPageActions/KeyPageActions';
import HeaderMainInput from './HeaderMainInput';
import { UsedBy, DependsOn } from './DependencyIndicator/DependencyIndicator';
import './KeyEditPage.css';

const Editor = ({
  keyPath,
  manifest,
  sourceFile,
  onManifestChange,
  onSourceFileChange,
  onDependencyChanged,
  onValidationChange,
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
        onValidationChange={onValidationChange}
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
    const { selectedKey, isInStickyMode, alerter, revision } = this.props;
    const {
      key,
      local: { manifest, implementation },
      revisionHistory,
      dependentKeys,
    } = selectedKey;
    const isHistoricRevision = revisionHistory && revision && revisionHistory[0].sha !== revision;
    const isReadonly = manifest.meta.readOnly || manifest.meta.archived || isHistoricRevision;

    const commonHeadersProps = {
      onKeyNameChanged: this.onKeyNameChanged,
      onDisplayNameChanged: this.onDisplayNameChanged,
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
                sourceFile={implementation.source}
                onSourceFileChange={source => this.props.updateImplementation({ source })}
                onManifestChange={this.onSelectedKeyManifestChanged}
                onDependencyChanged={this.onDependencyChanged}
                onValidationChange={this.props.changeKeyValidationState}
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
  const { isReadonly, isHistoricRevision } = props;

  return (
    <div className="sticky-key-header" disabled={isReadonly}>
      <HeaderMainInput {...props} />

      {!isReadonly
        ? <div className="sticky-key-page-action-wrapper">
            <KeyPageActions {...{ isReadonly, isHistoricRevision }} isInStickyMode />
          </div>
        : null}
    </div>
  );
};

const KeyFullHeader = (props) => {
  const {
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
      <KeyPageActions {...{ isReadonly, isHistoricRevision }} isInStickyMode={false} />

      <div className="key-meta-container">
        <div className="key-header-and-modification-wrapper">
          <HeaderMainInput {...props} />
          {revisionHistory
            ? <RevisionHistory revision={revision} revisionHistory={revisionHistory} />
            : null}
        </div>

        <fieldset disabled={isReadonly} style={{ border: 'none' }}>
          <div className="key-full-path">
            <label>Full path: </label>
            <label className="actual-path">
              {keyFullPath}
            </label>
          </div>

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
