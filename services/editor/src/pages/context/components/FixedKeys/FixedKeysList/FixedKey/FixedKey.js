import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import AutoSuggest from '../../../../../../components/common/ComboBox/AutoSuggest';
import TypedInput from '../../../../../../components/common/Input/TypedInput';
import * as SearchService from '../../../../../../services/search-service';
import * as TypesService from '../../../../../../services/types-service';
import { useDebounceValue } from '../../../../../../utils';
import './FixedKey.css';

const OverrideValueInput = ({ keyPath, ...props }) => {
  const [{ disabled, valueType }, setValueType] = useState({
    disabled: true,
    valueType: 'unknown',
  });

  const debouncedKeyPath = useDebounceValue(keyPath, 500);

  useEffect(() => {
    let cancel = false;

    TypesService.getValueTypeDefinition(debouncedKeyPath).then((x) => {
      if (cancel) {
        return;
      }
      setValueType({ disabled: false, valueType: x.name });
    });

    return () => {
      cancel = true;
    };
  }, [debouncedKeyPath]);

  return <TypedInput {...props} valueType={valueType} disabled={props.disabled || disabled} />;
};

const EditableKey = ({ keyPath, remote, local, onChange, autofocus }) => {
  const hasLocal = local !== undefined;
  const hasRemote = remote !== undefined;
  const hasChanges = remote !== local;
  const remoteValue = hasRemote && typeof remote === 'object' ? JSON.stringify(remote) : remote;
  return (
    <div
      className={classNames('editable-key-container', {
        'new-item': !hasRemote,
        removed: !hasLocal,
      })}
    >
      <AutoSuggest
        className="key-input"
        data-field="key"
        placeholder="Key"
        value={keyPath}
        getSuggestions={SearchService.getSuggestions}
        onChange={(keyPath) => onChange({ keyPath, value: local })}
        disabled={hasRemote}
        autofocus={autofocus}
      />
      <OverrideValueInput
        data-field="value"
        keyPath={keyPath}
        className={classNames('value-input', {
          'has-changes': hasChanges,
        })}
        placeholder="Value"
        value={!hasLocal ? remote : local}
        onChange={(value) => onChange({ keyPath, value })}
        disabled={!hasLocal}
      />
      {hasRemote && hasChanges ? (
        <div className="initial-value" title={remoteValue}>
          {remoteValue}
        </div>
      ) : null}
    </div>
  );
};

EditableKey.propTypes = {
  keyPath: PropTypes.string.isRequired,
  remote: PropTypes.any,
  local: PropTypes.any,
  onChange: PropTypes.func.isRequired,
};

const FixedKey = ({ toggleDelete, keyPath, ...props }) => (
  <div className="fixed-key-container" data-comp="fixed-key" data-fixed-key={keyPath}>
    <button
      onClick={toggleDelete}
      className="delete-button"
      data-comp="delete-fixed-key"
      title="Remove key"
    />
    <EditableKey keyPath={keyPath} {...props} />
  </div>
);

FixedKey.propTypes = {
  ...EditableKey.propTypes,
  toggleDelete: PropTypes.func.isRequired,
};

export default FixedKey;

const emptyKey = { keyPath: '', value: '' };

export const NewFixedKey = ({ appendKey, ...props }) => {
  const [{ keyPath, value }, setState] = useState(emptyKey);

  const onAppendKey = () => {
    if (keyPath === '' || value === '') {
      return;
    }
    appendKey({ keyPath, value });
    setState(emptyKey);
  };

  return (
    <div
      className="new-fixed-key"
      data-comp="new-fixed-key"
      onKeyUpCapture={(e) => {
        if (e.keyCode !== 13) {
          return;
        }
        onAppendKey();
      }}
    >
      <EditableKey {...props} onChange={setState} keyPath={keyPath} local={value} />
      <button className="add-key-button" data-field="add" title="Add key" onClick={onAppendKey} />
    </div>
  );
};
