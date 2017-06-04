import React, { Component } from 'react';
import PropTypes from 'prop-types';
import R from 'ramda';
import classnames from 'classnames';
import SaveButton from '../../../../components/common/SaveButton/SaveButton';
import FixedKeysList from './FixedKeysList/FixedKeysList';
import './FixedKeys.css';

function calculateKeys(fixedKeys) {
  const result = Object.entries(fixedKeys).map(([key, value]) => ({
    remote: { key, value },
    local: { key, value },
    isRemoved: false,
  }));

  if (result.length === 0) {
    return [
      {
        local: { key: '', value: '' },
        isRemoved: false,
      },
    ];
  }

  return result;
}

function exists(obj) {
  return obj !== undefined && obj.toString() !== '';
}

class FixedKeys extends Component {
  constructor(props) {
    super(props);

    const keys = calculateKeys(props.fixedKeys);
    this.state = {
      keys,
      hasChanges: false,
    };
  }

  componentWillReceiveProps(nextProps) {
    if (!R.equals(this.props.fixedKeys, nextProps.fixedKeys)) {
      const keys = calculateKeys(nextProps.fixedKeys);
      this.setState({
        keys,
        hasChanges: false,
      });
    }
  }

  onChange(index, isRemoved, local) {
    const keys = this.state.keys.slice();

    if (isRemoved && !keys[index].remote) {
      keys.splice(index, 1);
    } else {
      keys[index] = {
        ...keys[index],
        local,
        isRemoved,
      };
    }

    this.setState({
      keys,
      hasChanges: true,
    });
  }

  onSave() {
    const updatedConfiguration = this.state.keys
      .filter(x => !x.isRemoved && exists(x.local.key))
      .reduce((result, x) => ({ ...result, [x.local.key]: x.local.value }), {});

    this.props.updateFixedKeys(updatedConfiguration);
  }

  get canSave() {
    const { hasChanges, keys } = this.state;

    if (!hasChanges) return false;

    const existingKeys = keys.filter(x => !x.isRemoved);

    return (
      existingKeys.length === R.uniq(existingKeys.map(k => k.local.key)).length &&
      existingKeys
        .map(x => ({ key: exists(x.local.key), value: exists(x.local.value) }))
        .every(x => (x.key && x.value) || (!x.key && !x.value))
    );
  }

  appendKey() {
    const keys = this.state.keys.concat({
      local: { key: '', value: '' },
      isRemoved: false,
    });
    this.setState({ keys });
  }

  render() {
    const { className, isUpdatingContext } = this.props;

    return (
      <div className={classnames('fixed-keys-container', className)}>
        <div className={'override-keys-title'}>
          <div>Override Keys</div>
          <SaveButton
            onClick={this.onSave.bind(this)}
            hasChanges={this.canSave}
            isSaving={isUpdatingContext}
          />
        </div>

        <FixedKeysList keys={this.state.keys} onChange={this.onChange.bind(this)} />

        <button className={'add-key-button'} onClick={this.appendKey.bind(this)} />
      </div>
    );
  }
}

FixedKeys.propTypes = {
  fixedKeys: PropTypes.object,
  updateFixedKeys: PropTypes.func.isRequired,
  isUpdatingContext: PropTypes.bool,
  className: PropTypes.string,
};

FixedKeys.defaultProps = {
  fixedKeys: {},
  isUpdatingContext: false,
  className: undefined,
};

export default FixedKeys;
