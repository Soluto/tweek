import React, { PropTypes } from 'react';
import classNames from 'classnames';
import Input from '../../../../../../components/common/Input/Input';
import style from './FixedKey.css';

const configShape = {
  key: PropTypes.string,
  value: PropTypes.string,
};

const RemovedKey = ({ config: { key, value } }) => (
  <div className={style['removed-key-container']}>
    <div className={style['removed-key']}>{key}</div>
    <div className={style['removed-value']}>{value}</div>
  </div>
);

RemovedKey.propTypes = {
  config: PropTypes.shape(configShape).isRequired,
};

const EditableKey = ({ remote, local, onKeyChange, onValueChange }) => (
  <div className={classNames(style['editable-key-container'], { [style['new-item']]: !remote })}>
    <Input
      className={style['key-input']}
      placeholder="Key"
      value={local.key}
      onChange={e => onKeyChange(e.target.value)}
      disabled={!!remote}
    />
    <Input
      className={classNames(style['value-input'], { [style['has-changes']]: remote && remote.value !== local.value })}
      placeholder="Value"
      value={local.value}
      onChange={e => onValueChange(e.target.value)}
    />
    {
      remote && remote.value !== local.value ? <div className={style['initial-value']}>{remote.value}</div> : null
    }
  </div>
);

EditableKey.propTypes = {
  remote: PropTypes.shape(configShape),
  local: PropTypes.shape(configShape).isRequired,
  onKeyChange: PropTypes.func.isRequired,
  onValueChange: PropTypes.func.isRequired,
};

const FixedKey = ({ remote, local, isRemoved, onChange }) => (
  <div className={style['fixed-key-container']} data-fixed-key={local.key}>
    <button
      onClick={() => onChange(!isRemoved, local)}
      className={style['delete-button']}
      title="Remove key"
    />
    {
      isRemoved
        ? <RemovedKey config={remote} />
        : <EditableKey
          {...{ remote, local }}
          onKeyChange={key => onChange(isRemoved, { ...local, key })}
          onValueChange={value => onChange(isRemoved, { ...local, value })}
        />
        }
  </div>
);

FixedKey.propTypes = {
  onChange: PropTypes.func.isRequired,
  remote: PropTypes.shape(configShape),
  local: PropTypes.shape(configShape).isRequired,
  isRemoved: PropTypes.bool.isRequired,
};

export default FixedKey;
