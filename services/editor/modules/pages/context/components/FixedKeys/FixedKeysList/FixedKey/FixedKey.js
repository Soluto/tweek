import React, { PropTypes } from 'react';
import { compose, mapPropsStream, pure } from 'recompose';
import Rx from 'rxjs';
import classNames from 'classnames';
import * as SearchService from '../../../../../../services/search-service';
import * as TypesService from '../../../../../../services/types-service';
import TypedInput from '../../../../../../components/common/Input/TypedInput';
import AutoSuggest from '../../../../../../components/common/ComboBox/AutoSuggest';
import style from './FixedKey.css';

const configShape = {
  key: PropTypes.string,
  value: PropTypes.any,
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

const mapValueTypeToProps = (props$) => {
  const unknownType = 'unknown';

  const propsStream = props$.map(({ keyPath, ...props }) => props);

  const valueTypeStream = props$
    .map(x => x.keyPath)
    .distinctUntilChanged()
    .switchMap(keyPath =>
      Rx.Observable
        .fromPromise(TypesService.getValueTypeDefinition(keyPath))
        .map(x => x.name)
        .startWith(unknownType),
    )
    .map(valueType => ({ disabled: valueType === unknownType, valueType }));

  return propsStream.combineLatest(valueTypeStream, (props, valueType) => ({
    ...props,
    ...valueType,
  }));
};

const OverrideValueInput = compose(mapPropsStream(mapValueTypeToProps), pure)(TypedInput);

const EditableKey = ({ remote, local, onKeyChange, onValueChange }) => (
  <div className={classNames(style['editable-key-container'], { [style['new-item']]: !remote })}>
    <AutoSuggest
      className={style['key-input']}
      placeholder="Key"
      value={local.key}
      getSuggestions={SearchService.suggestions}
      onChange={onKeyChange}
      disabled={!!remote}
    />
    <OverrideValueInput
      keyPath={local.key}
      className={classNames(style['value-input'], {
        [style['has-changes']]: remote && remote.value !== local.value,
      })}
      placeholder="Value"
      value={local.value}
      onChange={onValueChange}
    />
    {remote && remote.value !== local.value
      ? <div className={style['initial-value']}>{remote.value}</div>
      : null}
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
    {isRemoved
      ? <RemovedKey config={remote} />
      : <EditableKey
        {...{ remote, local }}
        onKeyChange={key => onChange(isRemoved, { ...local, key })}
        onValueChange={value => onChange(isRemoved, { ...local, value })}
      />}
  </div>
);

FixedKey.propTypes = {
  onChange: PropTypes.func.isRequired,
  remote: PropTypes.shape(configShape),
  local: PropTypes.shape(configShape).isRequired,
  isRemoved: PropTypes.bool.isRequired,
};

export default FixedKey;
