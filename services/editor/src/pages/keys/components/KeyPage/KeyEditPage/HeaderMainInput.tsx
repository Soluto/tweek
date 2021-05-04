import React from 'react';
import { KeyManifest } from 'tweek-client';
import { EditableText } from '../../../../../components/common';

export type HeaderMainInputProps = {
  onDisplayNameChanged: (text: string) => void;
  keyManifest: KeyManifest;
  isReadonly?: boolean;
};

const HeaderMainInput = ({
  onDisplayNameChanged,
  keyManifest: {
    meta: { name: displayName, archived },
  },
  isReadonly,
}: HeaderMainInputProps) => (
  <div className="key-main-input">
    <EditableText
      data-comp="display-name"
      onTextChanged={(text) => onDisplayNameChanged(text)}
      placeHolder="Enter key display name"
      maxLength={80}
      value={archived ? `ARCHIVED: ${displayName}` : displayName}
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

export default HeaderMainInput;
