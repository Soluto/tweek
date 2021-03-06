import React from 'react';
import HeaderMainInput from './HeaderMainInput';
import KeyPageActions from './KeyPageActions/KeyPageActions';

export type KeyStickyHeaderProps = {
  isReadonly?: boolean;
  isHistoricRevision?: boolean;
};

const KeyStickyHeader = ({ isReadonly, isHistoricRevision }: KeyStickyHeaderProps) => (
  <div className="sticky-key-header">
    <HeaderMainInput />

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

export default KeyStickyHeader;
