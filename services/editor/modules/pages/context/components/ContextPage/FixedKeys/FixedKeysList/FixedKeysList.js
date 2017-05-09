import React, { PropTypes, Component } from 'react';
import R from 'ramda';
import FixedKey from './FixedKey/FixedKey';
import SaveButton from '../../../../../../components/common/SaveButton/SaveButton';
import style from './FixedKeysList.css';

function calculateKeys(fixedKeys) {
  const result = Object.entries(fixedKeys).map(([key, value]) => ({
    remote: { key, value },
    local: { key, value },
    isRemoved: false,
  }));

  if (result.length === 0) {
    return [{
      local: { key: '', value: '' },
      isRemoved: false,
    }];
  }

  return result;
}

function exists(obj) {
  return obj !== undefined && obj.toString() !== '';
}

class FixedKeysList extends Component {
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

    this.props.onSave(updatedConfiguration);
  }

  get canSave() {
    const { hasChanges, keys } = this.state;

    if (!hasChanges) return false;

    const existingKeys = keys.filter(x => !x.isRemoved);

    return existingKeys.length === R.uniq(existingKeys.map(k => k.local.key)).length &&
      existingKeys
        .map(x => ({ key: exists(x.local.key), value: exists(x.local.value) }))
        .every(x => (x.key && x.value) || (!x.key && !x.value));
  }

  appendKey() {
    const keys = this.state.keys.concat({
      local: { key: '', value: '' },
      isRemoved: false,
    });
    this.setState({ keys });
  }

  render() {
    const { keys } = this.state;

    return (
      <div className={style['fixed-keys-container']}>
        <SaveButton onClick={this.onSave.bind(this)} hasChanges={this.canSave} />
        {
          keys.map((key, index) => (
            <FixedKey
              key={key.remote ? key.remote.key : index}
              {...key}
              onChange={(...args) => this.onChange(index, ...args)}
            />
          ))
        }
        <button className={style['add-key-button']} onClick={this.appendKey.bind(this)} />
      </div>
    );
  }
}

FixedKeysList.propTypes = {
  fixedKeys: PropTypes.object.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default FixedKeysList;

