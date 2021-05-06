import classNames from 'classnames';
import { History } from 'history';
import React, { UIEventHandler, useState } from 'react';
import { connect } from 'react-redux';
import {
  deleteAlias,
  updateImplementation,
  updateKeyManifest,
  updateKeyName,
} from '../../../../../store/ducks/selectedKey';
import { KeyActions, SelectedKey } from '../../../../../store/ducks/types';
import KeyEditor from './KeyEditor';
import './KeyEditPage.css';
import KeyFullHeader from './KeyFullHeader';
import KeyStickyHeader from './KeyStickyHeader';

export type EditPageActions = Pick<
  KeyActions,
  'updateKeyManifest' | 'deleteAlias' | 'updateKeyName' | 'updateImplementation'
>;

const enhance = connect<{}, EditPageActions>(null, {
  updateKeyManifest,
  deleteAlias,
  updateKeyName,
  updateImplementation,
});

export type KeyEditPageProps = EditPageActions & {
  selectedKey: SelectedKey;
  revision?: string;
  history: History;
};

const KeyEditPage = ({
  selectedKey,
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
  const [isInStickyMode, setIsInStickyMode] = useState(false);

  const onScroll: UIEventHandler<HTMLDivElement> = (event) => {
    const distanceFromTop = (event.target as Element).scrollTop;
    const shouldShowSticky = distanceFromTop > 150;
    setIsInStickyMode(shouldShowSticky);
  };

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
    <div id="key-edit-page" className="key-edit-page" data-comp="key-edit-page" onScroll={onScroll}>
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

export default enhance(KeyEditPage);
