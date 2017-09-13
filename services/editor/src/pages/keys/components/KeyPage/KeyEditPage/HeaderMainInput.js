import React from 'react';
import EditableText from './EditableText/EditableText';
import KeyValueTypeSelector from './KeyValueTypeSelector/KeyValueTypeSelector';
import NewKeyInput from './NewKeyInput';

const HeaderMainInput = ({
  isInAddMode,
  onKeyNameChanged,
  onDisplayNameChanged,
  keyManifest: { meta: { name: displayName, archived }, valueType },
  isReadonly,
}) =>
  <div className="key-main-input">
    {isInAddMode
      ? <div className="new-key-input-wrapper">
          <NewKeyInput
            onKeyNameChanged={name => onKeyNameChanged(name)}
            displayName={displayName}
          />
          <div className="vertical-separator" />
          <KeyValueTypeSelector value={valueType} />
        </div>
      : <EditableText
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
        />}
  </div>;

export default HeaderMainInput;
