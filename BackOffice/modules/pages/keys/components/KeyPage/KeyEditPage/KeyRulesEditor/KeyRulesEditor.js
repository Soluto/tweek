import React from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import JPadEditor from './JPadEditor/JPadEditor';
import JPadTextEditor from './JPadTextEditor/JPadTextEditor';
import Mutator from '../../../../../../utils/mutator';
import wrapComponentWithClass from '../../../../../../hoc/wrap-component-with-class';
import { compose, pure, lifecycle } from 'recompose';
import style from './KeyRulesEditor.css';
import { types } from '../../../../../../services/TypesService';
import editorRulesValuesConverter from '../../../../../../services/editor-rules-values-converter';

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
      const {[propName]: _, ...otherProps } = this.props;
      return <Comp mutate={this.state.mutator} {...otherProps} />;
    }
  };

const KeyRulesEditor = ({ keyDef, mutate, schema, onMutation }) => {

  return (
    <div className={style['key-rules-editor-container']}>
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
          <JPadEditor
            jpadSource={keyDef.source}
            mutate={mutate}
            schema={schema}
            valueType={keyDef.valueType}
          />
        </TabPanel>
        <TabPanel className={style['tab-content']}>
          <JPadTextEditor
            source={keyDef.source}
            onChange={x => onMutation(JSON.parse(x))} />
          <pre className={style['key-def-json']} style={{"display": "none"}}>
            {JSON.stringify(JSON.parse(keyDef.source), null, 4)}
          </pre>
        </TabPanel>
      </Tabs>
    </div>
  );
};

function getTypedValue(value, valueType) {
  return editorRulesValuesConverter(value, valueType === types.bool.type ? '' : '' + value, valueType).value;
}

export default compose(
  MutatorFor('sourceTree'),
  wrapComponentWithClass,
  pure,
  lifecycle({
    componentWillReceiveProps({keyDef, mutate}) {
      const currentValueType = mutate.in('valueType').getValue();
      if (keyDef.valueType === currentValueType) return;
      mutate.apply(m => {
        m.in('valueType').updateValue(keyDef.valueType);

        const rulesMutate = m.in('rules');
        rulesMutate.getValue().map((rule, i) => {
          const ruleMutate = rulesMutate.in(i);

          const valueDistrubtion = ruleMutate.in('ValueDistribution').getValue();
          if (!valueDistrubtion) {
            const currentRuleValue = ruleMutate.in('Value').getValue();
            ruleMutate.in('Value').updateValue(getTypedValue(currentRuleValue, keyDef.valueType));
            return;
          }

          const valueToConvert = valueDistrubtion.type === 'weighted' ?
            Object.keys(valueDistrubtion['args'])[0] : '';
          const convertedValue = getTypedValue(valueToConvert, keyDef.valueType);

          ruleMutate
            .in('ValueDistribution').delete()
            .in('OwnerType').delete()
            .in('Type').updateValue('SingleVariant').up()
            .insert('Value', convertedValue);
        });

        return m;
      });
    }
  }))(KeyRulesEditor);
