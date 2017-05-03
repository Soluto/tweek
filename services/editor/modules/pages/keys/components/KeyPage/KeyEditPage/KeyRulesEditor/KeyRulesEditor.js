import React from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import JPadEditor from './JPadEditor/JPadEditor';
import JPadTextEditor from './JPadTextEditor/JPadTextEditor';
import Mutator from '../../../../../../utils/mutator';
import wrapComponentWithClass from '../../../../../../hoc/wrap-component-with-class';
import { compose, pure, lifecycle } from 'recompose';
import style from './KeyRulesEditor.css';
import * as TypesService from '../../../../../../services/types-service';

const MutatorFor = (propName) => (Comp) =>
  class extends React.Component {
    constructor() {
      super();
      this.state = {};
    }
    componentWillMount() {
      this.state.mutator = Mutator.stateless(() => this.props[propName], this.props.onMutation);
    }
    render() {
      const { [propName]: _, ...otherProps } = this.props;
      return <Comp mutate={this.state.mutator} {...otherProps} />;
    }
  };

const KeyRulesEditor = ({ keyDef, mutate, onMutation, alerter, isReadonly }) => {

  return (
    <div className={style['key-rules-editor-container']} disabled={isReadonly}>

      <Tabs className={style['tab-container']}>

        <TabList>
          <Tab className={style['tab-header']}>
            <label className={style['key-definition-tab-icon']}>&#xE904; </label>
            <label className={style['tab-title']}>Rules</label>
          </Tab>
          <Tab className={style['tab-header']}>
            <label className={style['key-source-tab-icon']}>&#xE901; </label>
            <label className={style['tab-title']}>Source</label>
          </Tab>
        </TabList>
        <TabPanel className={style['tab-content']}>
          <fieldset disabled={isReadonly} style={{border:'none'}} >
            <JPadEditor
              {...{ mutate, alerter }}
              jpadSource={keyDef.source}
              valueType={keyDef.valueType}
            />
          </fieldset>

        </TabPanel>
        <TabPanel className={style['tab-content']}>
          <JPadTextEditor
            source={keyDef.source}
            onChange={x => onMutation(JSON.parse(x))} 
            isReadonly={isReadonly}/>
          <pre className={style['key-def-json']} style={{ "display": "none" }}>
            {JSON.stringify(JSON.parse(keyDef.source), null, 4)}
          </pre>
        </TabPanel>

      </Tabs>

    </div>
  );
};

function getTypedValue(value, valueType) {
  try {
    return TypesService.convertValue(value, valueType);
  }
  catch (err) {
    return valueType === TypesService.types.boolean.name ? '' : '' + value
  }
}

function changeValueType(valueType, rulesMutate, depth) {
  const rules = rulesMutate.getValue();
  if (depth == 0) {
    for (let i = 0; i < rules.length; i++) {
      const ruleMutate = rulesMutate.in(i);

      const valueDistrubtion = ruleMutate.in('ValueDistribution').getValue();
      if (!valueDistrubtion) {
        const currentRuleValue = ruleMutate.in('Value').getValue();
        ruleMutate.in('Value').updateValue(getTypedValue(currentRuleValue, valueType));
        break;
      }

      const valueToConvert = valueDistrubtion.type === 'weighted' ?
        Object.keys(valueDistrubtion['args'])[0] : '';
      const convertedValue = getTypedValue(valueToConvert, valueType);

      ruleMutate
        .in('ValueDistribution').delete()
        .in('OwnerType').delete()
        .in('Type').updateValue('SingleVariant').up()
        .insert('Value', convertedValue);
    }
    return;
  }

  Object.keys(rules).forEach(key => changeValueType(valueType, rulesMutate.in(key), depth - 1));
}

export default compose(
  MutatorFor('sourceTree'),
  wrapComponentWithClass,
  pure,
  lifecycle({
    componentWillReceiveProps({ keyDef, mutate }) {
      const currentValueType = mutate.in('valueType').getValue();
      if (keyDef.valueType === currentValueType) return;

      mutate.apply(m => {
        m.in('valueType').updateValue(keyDef.valueType);
        changeValueType(keyDef.valueType, m.in('rules'), m.in('partitions').getValue().length);
        return m;
      });
    }
  }))(KeyRulesEditor);
