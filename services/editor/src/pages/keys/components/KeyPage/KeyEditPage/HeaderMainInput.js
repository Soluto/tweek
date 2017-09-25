import React from 'react';
import EditableText from './EditableText/EditableText';

const HeaderMainInput = ({
  onKeyNameChanged,
  onDisplayNameChanged,
  keyManifest: { meta: { name: displayName, archived }, valueType },
  isReadonly,
}) =>
  <div className="key-main-input">
    <EditableText
      data-comp="display-name"
      onTextChanged={text => onDisplayNameChanged(text)}
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
  </div>;

export default HeaderMainInput;
