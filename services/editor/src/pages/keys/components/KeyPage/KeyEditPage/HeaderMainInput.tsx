import React from 'react';
import { EditableText } from '../../../../../components/common';
import { createUseSelectedKey } from '../../../../../contexts/SelectedKey/useSelectedKey';
import { useUpdateKey } from '../../../../../contexts/SelectedKey/useUpdateKey';

const useSelectedKey = createUseSelectedKey(({ manifest, revision, revisionHistory }) => {
  const isHistoricRevision = Boolean(
    revisionHistory && revision && revisionHistory[0].sha !== revision,
  );

  return {
    isHistoricRevision,
    manifest,
  };
});

const HeaderMainInput = () => {
  const { manifest, isHistoricRevision } = useSelectedKey();
  const { updateKeyManifest } = useUpdateKey();

  const isReadonly = manifest?.meta.readOnly || manifest?.meta.archived || isHistoricRevision;
  const displayName = manifest?.meta.name || manifest?.key_path || '';

  return (
    <div className="key-main-input">
      <EditableText
        data-comp="display-name"
        onTextChanged={(name) =>
          manifest && updateKeyManifest({ ...manifest, meta: { ...manifest.meta, name } })
        }
        placeHolder="Enter key display name"
        maxLength={80}
        value={manifest?.meta.archived ? `ARCHIVED: ${displayName}` : displayName}
        isReadonly={isReadonly}
        classNames={{
          container: 'display-name-container',
          input: 'display-name-input',
          text: 'display-name-text',
          form: 'display-name-form',
        }}
      />
    </div>
  );
};

export default HeaderMainInput;
