import React, { Component, PropTypes } from 'react';
import { compose, mapProps, lifecycle } from 'recompose';
import { connect } from 'react-redux';
import R from 'ramda';
import changeCase from 'change-case';
import transformProps from '../../../../utils/transformProps';
import { getContext, updateContext } from '../../../../store/ducks/context';
import FixedKeysList from './FixedKeysList/FixedKeysList';
import SaveButton from '../../../../components/common/SaveButton/SaveButton';
import style from './FixedKeys.css';

const removeFixedPrefix = transformProps(prop => prop.replace('@fixed:', ''));
const addFixedPrefix = transformProps(prop => `@fixed:${prop.trim()}`);

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

    this.props.updateContext(updatedConfiguration);
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
    const { contextType, contextId } = this.props;

    return (
      <div className={style['fixed-keys-container']}>
        <div className={style['horizontal-separator']} />

        <div className={style['context-title']}>
          <div className={style['context-id']}>{contextId}</div>
          <div className={style['context-type']}>{changeCase.pascalCase(contextType)}</div>
        </div>

        <div className={style['fixed-keys-list-container']}>
          <div className={style['override-keys-title']}>
            <div>Override Keys</div>
            <SaveButton onClick={this.onSave.bind(this)} hasChanges={this.canSave} isSaving={this.props.isUpdatingContext} />
          </div>

          <FixedKeysList
            keys={this.state.keys}
            onChange={this.onChange.bind(this)}
          />

          <button className={style['add-key-button']} onClick={this.appendKey.bind(this)} />
        </div>
      </div>
    );
  }
}


FixedKeys.propTypes = {
  fixedKeys: PropTypes.object.isRequired,
  updateContext: PropTypes.func.isRequired,
  contextType: PropTypes.string.isRequired,
  contextId: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({ ...state.context });

const mapDispatchToProps = (dispatch, props) => ({
  ...props,
  getContext: () => dispatch(getContext({
    contextType: props.contextType,
    contextId: props.contextId,
  })),
  updateContext: updatedConfiguration => dispatch(updateContext({
    contextType: props.contextType,
    contextId: props.contextId,
    updatedContextData: addFixedPrefix(updatedConfiguration),
  })),
});

function getFixedKeys(contextData) {
  return R.pickBy((_, prop) => prop.startsWith('@fixed:'), contextData);
}

export default compose(
  mapProps(props => props.params),
  connect(mapStateToProps, mapDispatchToProps),
  lifecycle({
    componentWillMount() {
      this.props.getContext();
    },

    componentDidUpdate(prev) {
      const { props } = this;
      if (props.contextId !== prev.contextId || props.contextType !== prev.contextType) {
        props.getContext();
      }
    },
  }),
  mapProps(({ contextData, ...props }) => ({
    ...props,
    fixedKeys: removeFixedPrefix(getFixedKeys(contextData || {})),
  })),
)(FixedKeys);
