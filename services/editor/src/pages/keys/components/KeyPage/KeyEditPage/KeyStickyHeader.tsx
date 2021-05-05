import React from 'react';
import HeaderMainInput, { HeaderMainInputProps } from './HeaderMainInput';
import KeyPageActions from './KeyPageActions/KeyPageActions';

export type KeyStickyHeaderProps = HeaderMainInputProps & {
  isHistoricRevision?: boolean;
};

const KeyStickyHeader = ({
  isReadonly,
  isHistoricRevision,
  keyManifest,
  onDisplayNameChanged,
}: KeyStickyHeaderProps) => {
  return (
    <div className="sticky-key-header">
      <HeaderMainInput
        isReadonly={isReadonly}
        keyManifest={keyManifest}
        onDisplayNameChanged={onDisplayNameChanged}
      />

      {!isReadonly && (
        <div className="sticky-key-page-action-wrapper">
          <KeyPageActions
            isReadonly={isReadonly}
            isHistoricRevision={isHistoricRevision}
            isInStickyMode
          />
        </div>
      )}
    </div>
  );
};

export default KeyStickyHeader;
