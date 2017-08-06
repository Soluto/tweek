import React from 'react';
import PropTypes from 'prop-types';
import { compose, mapPropsStream, pure } from 'recompose';
import Rx from 'rxjs';
import classNames from 'classnames';
import * as SearchService from '../../../../../../services/search-service';
import * as TypesService from '../../../../../../services/types-service';
import TypedInput from '../../../../../../components/common/Input/TypedInput';
import AutoSuggest from '../../../../../../components/common/ComboBox/AutoSuggest';
import './FixedKey.css';

const mapValueTypeToProps = (props$) => {
  const propsStream = props$.map(({ keyPath, ...props }) => props);

  const valueTypeStream = props$
    .map(x => x.keyPath)
    .debounceTime(500)
    .distinctUntilChanged()
    .switchMap(keyPath =>
      Rx.Observable.fromPromise(TypesService.getValueTypeDefinition(keyPath)).map(x => x.name),
    )
    .map(valueType => ({ disabled: false, valueType }))
    .startWith({ disabled: true, valueType: 'unknown' });

  return propsStream.combineLatest(valueTypeStream, (props, valueType) => ({
    ...props,
    ...valueType,
    disabled: props.disabled || valueType.disabled,
  }));
};

const OverrideValueInput = compose(mapPropsStream(mapValueTypeToProps), pure)(TypedInput);
OverrideValueInput.displayName = 'OverrideValueInput';

const EditableKey = ({ keyPath, remote, local, onChange }) =>
  <div
    className={classNames('editable-key-container', {
      'new-item': remote === undefined,
      removed: local === undefined,
    })}
  >
    <AutoSuggest
      className="key-input"
      placeholder="Key"
      value={keyPath}
      getSuggestions={SearchService.getSuggestions}
      onChange={keyPath => onChange({ keyPath, value: local })}
      disabled={remote !== undefined}
    />
    <OverrideValueInput
      keyPath={keyPath}
      className={classNames('value-input', {
        'has-changes': remote !== local,
      })}
      placeholder="Value"
      value={local === undefined ? remote : local}
      onChange={value => onChange({ keyPath, value })}
      disabled={local === undefined}
    />
    {remote !== undefined && remote !== local
      ? <div className="initial-value">
          {remote.length > 40 ? `${remote.substring(0, 37)}...` : remote}
        </div>
      : null}
  </div>;

EditableKey.propTypes = {
  keyPath: PropTypes.string.isRequired,
  remote: PropTypes.any,
  local: PropTypes.any,
  onChange: PropTypes.func.isRequired,
};

const FixedKey = ({ toggleDelete, ...props, keyPath }) =>
  <div className="fixed-key-container" data-fixed-key={keyPath}>
    <button
      onClick={toggleDelete}
      className="delete-button"
      data-comp="delete-key-button"
      title="Remove key"
    />
    <EditableKey {...props} />
  </div>;

FixedKey.propTypes = {
  ...EditableKey.propTypes,
  toggleDelete: PropTypes.func.isRequired,
};

export default FixedKey;
