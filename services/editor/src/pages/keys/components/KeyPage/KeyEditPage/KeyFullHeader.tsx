import { History } from 'history';
import React, { useMemo } from 'react';
import { KeyManifest, Revision } from 'tweek-client';
import { EditableTextArea } from '../../../../../components/common';
import { Aliases, DependsOn, UsedBy } from './DependencyIndicator/DependencyIndicator';
import HeaderMainInput from './HeaderMainInput';
import KeyPageActions from './KeyPageActions/KeyPageActions';
import KeyTags from './KeyTags/KeyTags';
import RevisionHistory from './RevisionHistory/RevisionHistory';

type HookLinksProps = {
  keyFullPath: string;
  history: History;
};

const HookLinks = ({ keyFullPath, history }: HookLinksProps) => {
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

export type KeyFullHeaderProps = HookLinksProps & {
  isReadonly?: boolean;
  revisionHistory?: Revision[];
  keyManifest: KeyManifest;
  onDescriptionChanged: (desc: string) => void;
  onTagsChanged: (tags: string[]) => void;
  revision?: string;
  isHistoricRevision?: boolean;
  usedBy?: string[];
  aliases?: string[];
  deleteAlias: (dep: string) => void;
  onDisplayNameChanged: (text: string) => void;
};

const KeyFullHeader = ({
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
  onDisplayNameChanged,
}: KeyFullHeaderProps) => {
  return (
    <div className="key-header">
      <KeyPageActions
        isReadonly={isReadonly}
        isHistoricRevision={isHistoricRevision}
        isInStickyMode={false}
      />

      <div className="key-meta-container">
        <div className="key-header-and-modification-wrapper">
          <HeaderMainInput
            isReadonly={isReadonly}
            keyManifest={keyManifest}
            onDisplayNameChanged={onDisplayNameChanged}
          />
          {revisionHistory && (
            <RevisionHistory revision={revision} revisionHistory={revisionHistory} />
          )}
        </div>

        <fieldset disabled={isReadonly} style={{ border: 'none' }}>
          <div className="key-full-path">
            <label>Full path: </label>
            <label className="actual-path">{keyFullPath}</label>
          </div>

          <div className="key-description-tags-hooks-wrapper">
            <div className="key-description-wrapper">
              <EditableTextArea
                value={keyManifest.meta.description}
                onTextChanged={onDescriptionChanged}
                placeHolder="Write key description"
                title="Click to edit description"
                classNames={{ input: 'description-input' }}
                maxLength={400}
              />
              <UsedBy items={usedBy} />
              <DependsOn items={keyManifest.dependencies} />
              <Aliases items={aliases} deleteAlias={deleteAlias} />
            </div>

            <div className="key-tags-wrapper">
              <KeyTags onTagsChanged={onTagsChanged} tags={keyManifest.meta.tags || []} />
            </div>

            {revisionHistory && <HookLinks keyFullPath={keyFullPath} history={history} />}
          </div>
        </fieldset>
      </div>
    </div>
  );
};

export default KeyFullHeader;
