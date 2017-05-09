import React, { PropTypes, Component } from 'react';
import Button from '../../../Button/Button';
import Input from '../../../../../../components/common/Input/Input';
import getConfigurationDiff from '../getConfigurationDiff';
import style from './FixedKeysList.css';

function renderConfigurationDiff(key, diff, onDelete) {
  // REFACTOR //

  if (key === undefined || key === '') {
    return null;
  }

  let keyComponent;
  let valueComponent;

  if (diff.isAdded) {
    keyComponent = <div className={classes.col} style={{ color: 'green' }}>{ key }</div>;
    valueComponent = <div className={classes.col} style={{ color: 'green' }}>{ diff.newValue }</div>;
  } else if (diff.isUpdated) {
    keyComponent = <div className={classes.col}>{ key }</div>;
    valueComponent = (<div className={classes.col} style={{ color: 'green' }}>{ diff.newValue }<br />
      <small style={{ textDecoration: 'line-through', color: 'red' }}>{diff.initialValue}</small></div>);
  } else if (diff.isRemoved) {
    keyComponent = <div className={classes.col} style={{ textDecoration: 'line-through', color: 'red' }}>{ key }</div>;
    valueComponent = <div className={classes.col} style={{ textDecoration: 'line-through', color: 'red' }}>{ diff.initialValue }</div>;
  } else {
    keyComponent = <div className={classes.col}>{ key }</div>;
    valueComponent = (<div style={{ display: 'flex', flexDirection: 'row' }} className={classes.col}>
      <div style={{ display: 'flex', flexDirection: 'col' }}>{ diff.newValue } </div>
    </div>);
  }

  return (<tr key={key}>
    <td>{ keyComponent }</td>
    <td>{ valueComponent }</td>
    <td>{
      diff.isRemoved ? null : <Button text="Delete" onClick={onDelete} />
    }</td>
  </tr>);
}

class FixedConfigurationTable extends Component {
  constructor(props) {
    super(props);

    const newConfiguration = props.fixedConfigurations;
    const configurationDiff = getConfigurationDiff({ newConfiguration });

    this.state = {
      newConfiguration,
      configurationDiff,
      keyToAppend: '',
      valueToAppend: '',
    };
  }

  componentWillReceiveProps(nextProps) {
    const newConfiguration = nextProps.fixedConfigurations;

    this.setState({
      newConfiguration,
      configurationDiff: getConfigurationDiff({ newConfiguration }),
      keyToAppend: '',
      valueToAppend: '',
    });
  }

  render() {
    const { configurationDiff } = this.state;

    return (
      <table className={style['fixed-keys-list']}>
        <thead>
          <tr>
            <th>Key</th>
            <th>Value</th>
            <th />
          </tr>
        </thead>

        <tbody>
          {
            Object.entries(configurationDiff).map(([key, diff]) =>
              renderConfigurationDiff(key, diff, () => this.onDelete(key)))
          }

          <tr>
            <td>
              <Input
                placeholder="key" value={this.state.keyToAppend}
                onEnterKeyPress={() => this.appendConfiguration()}
                onChange={e => this.onKeyToAppendChange(e.target.value)}
              />
            </td>
            <td>
              <Input
                placeholder="value" value={this.state.valueToAppend}
                onEnterKeyPress={() => this.appendConfiguration()}
                onChange={e => this.onValueToAppendChange(e.target.value)}
              />
            </td>
            <td>
              <Button text="Add" onClick={this.appendConfiguration.bind(this)} />
            </td>
          </tr>
          <tr>
            <td><Button onClick={() => this.onSave()} text={'Save'} /></td>
          </tr>
        </tbody>
      </table>
    );
  }

  onSave() {
    this.props.onSave({
      updatedConfiguration: this.state.newConfiguration,
      deletedKeys: Object
        .entries(this.state.configurationDiff)
        .filter(([key, value]) => value.isRemoved)
        .map(([key, value]) => key),
    });
  }

  onDelete(key) {
    const newConfiguration = Object.keys(this.state.newConfiguration)
      .filter(configKey => configKey != key)
      .reduce((result, configKey) => ({
        ...result,
        [configKey]: this.state.newConfiguration[configKey],
      }), {});

    this.setState({
      newConfiguration,
      configurationDiff: getConfigurationDiff({
        newConfiguration,
        initialConfiguration: this.props.fixedConfigurations,
      }),
    });
  }

  onValueToAppendChange(valueToAppend) {
    this.setState({ valueToAppend });
  }

  onKeyToAppendChange(keyToAppend) {
    this.setState({ keyToAppend });
  }

  appendConfiguration() {
    const newConfiguration = {
      ...this.state.newConfiguration,
      [this.state.keyToAppend]: this.state.valueToAppend,
    };

    this.setState({
      newConfiguration,
      configurationDiff: getConfigurationDiff({
        newConfiguration,
        initialConfiguration: this.props.fixedConfigurations,
      }),
      keyToAppend: '',
      valueToAppend: '',
    });
  }
}

FixedConfigurationTable.propTypes = {
  fixedConfigurations: PropTypes.object.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default FixedConfigurationTable;

