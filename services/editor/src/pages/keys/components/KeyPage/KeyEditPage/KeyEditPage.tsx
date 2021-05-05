import classNames from 'classnames';
import { History } from 'history';
import React from 'react';
import stickyHeaderIdentifier from '../../../../../hoc/sticky-header-identifier';
import { KeyActions, SelectedKey } from '../../../../../store/ducks/types';
import KeyEditor from './KeyEditor';
import './KeyEditPage.css';
import KeyFullHeader from './KeyFullHeader';
import KeyStickyHeader from './KeyStickyHeader';

export type EditPageActions = Pick<
  KeyActions,
  'updateKeyManifest' | 'deleteAlias' | 'updateKeyName' | 'updateImplementation'
>;

export type KeyEditPageProps = EditPageActions & {
  selectedKey: SelectedKey;
  isInStickyMode: boolean;
  revision?: string;
  history: History;
};

const KeyEditPage = ({
  selectedKey,
  isInStickyMode,
  revision,
  history,
  deleteAlias,
  updateKeyName,
  updateKeyManifest,
  updateImplementation,
}: KeyEditPageProps) => {
  const {
    key,
    local: { manifest, implementation },
    revisionHistory,
    usedBy,
    aliases,
  } = selectedKey;

  const onTagsChanged = (newTags: string[]) =>
    updateKeyManifest({
      ...manifest,
      meta: {
        ...manifest.meta,
        tags: newTags,
      },
    });

  const onDisplayNameChanged = (newDisplayName: string) =>
    updateKeyManifest({
      ...manifest,
      meta: {
        ...manifest.meta,
        name: newDisplayName,
      },
    });

  const onDescriptionChanged = (newDescription: string) =>
    updateKeyManifest({
      ...manifest,
      meta: {
        ...manifest.meta,
        description: newDescription,
      },
    });

  const onDependencyChanged = (dependencies: string[]) =>
    updateKeyManifest({
      ...manifest,
      dependencies,
    });

  const isHistoricRevision = Boolean(
    revisionHistory && revision && revisionHistory[0].sha !== revision,
  );
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
            usedBy={usedBy}
            aliases={aliases}
            deleteAlias={deleteAlias}
            history={history}
          />

          <div className={classNames('key-rules-editor', { sticky: isInStickyMode })}>
            <KeyEditor
              manifest={manifest}
              sourceFile={implementation.source as string}
              onSourceFileChange={(source) => updateImplementation({ source })}
              onManifestChange={updateKeyManifest}
              onDependencyChanged={onDependencyChanged}
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
