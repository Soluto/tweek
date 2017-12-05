import React from 'react';
import PropTypes from 'prop-types';
import { compose, mapPropsStream, pure, withStateHandlers, mapProps } from 'recompose';
import { Observable } from 'rxjs';
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
      Observable.fromPromise(TypesService.getValueTypeDefinition(keyPath)).map(x => x.name),
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

const EditableKey = ({ keyPath, remote, local, onChange, autofocus }) => (
  <div
    className={classNames('editable-key-container', {
      'new-item': remote === undefined,
      removed: local === undefined,
    })}
  >
    <AutoSuggest
      className="key-input"
      data-field="key"
      placeholder="Key"
      value={keyPath}
      getSuggestions={SearchService.getSuggestions}
      onChange={keyPath => onChange({ keyPath, value: local })}
      disabled={remote !== undefined}
      autofocus={autofocus}
    />
    <OverrideValueInput
      data-field="value"
      keyPath={keyPath}
      className={classNames('value-input', {
        'has-changes': remote !== local,
      })}
      placeholder="Value"
      value={local === undefined ? remote : local}
      onChange={value => onChange({ keyPath, value })}
      disabled={local === undefined}
    />
    {remote !== undefined && remote !== local ? (
      <div className="initial-value" title={remote}>
        {remote}
      </div>
    ) : null}
  </div>
);

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

const NewFixedKeyComponent = ({ appendKey, keyPath, local: value, ...props }) => (
  <div
    className="new-fixed-key"
    data-comp="new-fixed-key"
    onKeyUpCapture={(e) => {
      if (e.keyCode !== 13 || keyPath === '' || value === '') return;
      appendKey();
    }}
  >
    <EditableKey {...props} keyPath={keyPath} local={value} />
    <button className="add-key-button" data-field="add" title="Add key" onClick={appendKey} />
  </div>
);

export const NewFixedKey = compose(
  withStateHandlers(emptyKey, {
    onChange: () => newState => newState,
    reset: () => () => emptyKey,
  }),
  mapProps(({ appendKey, reset, value: local, keyPath, ...props }) => ({
    appendKey: () => {
      appendKey({ keyPath, value: local });
      reset();
    },
    local,
    keyPath,
    ...props,
  })),
)(NewFixedKeyComponent);

NewFixedKey.displayName = 'NewFixedKey';
