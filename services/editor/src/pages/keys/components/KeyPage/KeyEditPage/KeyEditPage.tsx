import classNames from 'classnames';
import React, { UIEventHandler, useState } from 'react';
import { createUseSelectedKey, useUpdateKey } from '../../../../../contexts/SelectedKey';
import KeyEditor from './KeyEditor';
import './KeyEditPage.css';
import KeyFullHeader from './KeyFullHeader';
import KeyStickyHeader from './KeyStickyHeader';

const useSelectedKey = createUseSelectedKey((key) => ({
  manifest: key.manifest!,
  implementation: key.implementation,
  revisionHistory: key.revisionHistory,
  usedBy: key.usedBy,
  aliases: key.aliases,
  revision: key.revision,
}));

const KeyEditPage = () => {
  const { manifest, implementation, revisionHistory, usedBy, aliases, revision } = useSelectedKey();

  const { updateKeyManifest } = useUpdateKey();

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
    isHistoricRevision,
    isReadonly,
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
            keyFullPath={manifest.key_path}
            usedBy={usedBy}
            aliases={aliases}
            keyManifest={manifest}
          />

          <div className={classNames('key-rules-editor', { sticky: isInStickyMode })}>
            <KeyEditor
              manifest={manifest}
              sourceFile={implementation!}
              onDependencyChanged={onDependencyChanged}
              isReadonly={isReadonly}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default KeyEditPage;
