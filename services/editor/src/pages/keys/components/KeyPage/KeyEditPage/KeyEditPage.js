import React, { Component, useCallback, useMemo } from 'react';
import { compose, pure } from 'recompose';
import classNames from 'classnames';
import JPadFullEditor from '../../../../../components/JPadFullEditor/JPadFullEditor';
import stickyHeaderIdentifier from '../../../../../hoc/sticky-header-identifier';
import ConstEditor from '../../../../../components/ConstEditor';
import KeyTags from './KeyTags/KeyTags';
import MarkdownEditor from '../../../../../components/common/MarkdownEditor/MarkdownEditor';
import RevisionHistory from './RevisionHistory/RevisionHistory';
import KeyPageActions from './KeyPageActions/KeyPageActions';
import HeaderMainInput from './HeaderMainInput';
import { UsedBy, DependsOn, Aliases } from './DependencyIndicator/DependencyIndicator';
import { types } from '../../../../../services/types-service';
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
  const valueType = types[manifest.valueType] || types['string'];
  if (manifest.implementation.type === 'file') {
    let FileEditor = null;
    if (manifest.implementation.format === 'jpad') {
      FileEditor = JPadFullEditor;
    }
    return (
      <JPadFullEditor
        keyPath={keyPath}
        alerter={alerter}
        source={sourceFile}
        onChange={onSourceFileChange}
        dependencies={manifest.dependencies}
        onDependencyChanged={onDependencyChanged}
        isReadonly={isReadonly}
        valueType={valueType}
      />
    );
  }
  if (manifest.implementation.type === 'const') {
    return (
      <ConstEditor
        value={manifest.implementation.value}
        valueType={valueType}
        onChange={(value) =>
          onManifestChange({ ...manifest, implementation: { ...manifest.implementation, value } })
        }
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
    const { selectedKey, isInStickyMode, alerter, revision, deleteAlias, history } = this.props;
    const {
      key,
      local: { manifest, implementation },
      revisionHistory,
      usedBy,
      aliases,
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
              onDescriptionChanged={(text) => this.onDescriptionChanged(text)}
              onTagsChanged={(newTags) => this.onTagsChanged(newTags)}
              revisionHistory={revisionHistory}
              revision={revision}
              keyFullPath={key}
              isInStickyMode={isInStickyMode}
              usedBy={usedBy}
              aliases={aliases}
              deleteAlias={deleteAlias}
              history={history}
            />

            <div className={classNames('key-rules-editor', { sticky: isInStickyMode })}>
              <Editor
                keyPath={key}
                manifest={manifest}
                sourceFile={implementation.source}
                onSourceFileChange={(source) => this.props.updateImplementation({ source })}
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

export default compose(
  stickyHeaderIdentifier('key-edit-page', 150),
  pure,
)(KeyEditPage);

const KeyStickyHeader = (props) => {
  const { isReadonly, isHistoricRevision } = props;

  return (
    <div className="sticky-key-header" disabled={isReadonly}>
      <HeaderMainInput {...props} />

      {!isReadonly ? (
        <div className="sticky-key-page-action-wrapper">
          <KeyPageActions {...{ isReadonly, isHistoricRevision }} isInStickyMode />
        </div>
      ) : null}
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
    usedBy,
    aliases,
    deleteAlias,
    history,
  } = props;

  return (
    <div className="key-header">
      <KeyPageActions {...{ isReadonly, isHistoricRevision }} isInStickyMode={false} />

      <div className="key-meta-container">
        <div className="key-header-and-modification-wrapper">
          <HeaderMainInput {...props} />
          {revisionHistory ? (
            <RevisionHistory revision={revision} revisionHistory={revisionHistory} />
          ) : null}
        </div>

        <fieldset disabled={isReadonly} style={{ border: 'none' }}>
          <div className="key-full-path">
            <label>Full path: </label>
            <label className="actual-path">{keyFullPath}</label>
          </div>

          <div className="key-description-tags-hooks-wrapper">
            <div className="key-description-wrapper">
              <MarkdownEditor
                value={keyManifest.meta.description}
                onChange={onDescriptionChanged}
              />
              <UsedBy items={usedBy} />
              <DependsOn items={keyManifest.dependencies} />
              <Aliases items={aliases} deleteAlias={deleteAlias} />
            </div>

            <div className="key-tags-wrapper">
              <KeyTags
                onTagsChanged={(newTags) => onTagsChanged(newTags)}
                tags={keyManifest.meta.tags || []}
              />
            </div>

            {revisionHistory && <HookLinks {...{ keyFullPath, history }} />}
          </div>
        </fieldset>
      </div>
    </div>
  );
};

const HookLinks = ({ keyFullPath, history }) => {
  const encodedKeyPath = useMemo(() => encodeURIComponent(keyFullPath), [keyFullPath]);
  const addHook = () => history.push(`/settings/hooks/edit/?keyPath=${encodedKeyPath}`);
  const viewHooks = () => history.push(`/settings/hooks/?keyPathFilter=${encodedKeyPath}`);

  return (
    <div className="key-hooks-wrapper">
      <button className="metro-button" onClick={addHook}>
        Add Hook
      </button>
      <button className="metro-button" onClick={viewHooks}>
        View Hooks
      </button>
    </div>
  );
};
