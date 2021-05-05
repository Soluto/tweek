import classNames from 'classnames';
import React from 'react';
import stickyHeaderIdentifier from '../../../../../hoc/sticky-header-identifier';
import KeyEditor from './KeyEditor';
import './KeyEditPage.css';
import KeyFullHeader from './KeyFullHeader';
import KeyStickyHeader from './KeyStickyHeader';

const KeyEditPage = ({
  selectedKey,
  isInStickyMode,
  revision,
  deleteAlias,
  history,
  updateKeyName,
  updateKeyManifest,
  updateImplementation,
  changeKeyValidationState,
}) => {
  const {
    key,
    local: { manifest, implementation },
    revisionHistory,
    usedBy,
    aliases,
  } = selectedKey;

  const onTagsChanged = (newTags) =>
    updateKeyManifest({
      ...manifest,
      meta: {
        ...manifest.meta,
        tags: newTags,
      },
    });

  const onDisplayNameChanged = (newDisplayName) =>
    updateKeyManifest({
      ...manifest,
      meta: {
        ...manifest.meta,
        name: newDisplayName,
      },
    });

  const onDescriptionChanged = (newDescription) =>
    updateKeyManifest({
      ...manifest,
      meta: {
        ...manifest.meta,
        description: newDescription,
      },
    });

  const onDependencyChanged = (dependencies) =>
    updateKeyManifest({
      ...manifest,
      dependencies,
    });

  const isHistoricRevision = revisionHistory && revision && revisionHistory[0].sha !== revision;
  const isReadonly = manifest.meta.readOnly || manifest.meta.archived || isHistoricRevision;

  const commonHeadersProps = {
    onKeyNameChanged: updateKeyName,
    onDisplayNameChanged,
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
            onDescriptionChanged={onDescriptionChanged}
            onTagsChanged={onTagsChanged}
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
            <KeyEditor
              keyPath={key}
              manifest={manifest}
              sourceFile={implementation.source}
              onSourceFileChange={(source) => updateImplementation({ source })}
              onManifestChange={updateKeyManifest}
              onDependencyChanged={onDependencyChanged}
              onValidationChange={changeKeyValidationState}
              isReadonly={isReadonly}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const enhance = stickyHeaderIdentifier('key-edit-page', 150);

export default enhance(KeyEditPage);
