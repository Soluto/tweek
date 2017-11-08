import React from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { compose, pure, lifecycle, mapProps, withState } from 'recompose';
import * as R from 'ramda';
import Mutator from '../../utils/mutator';
import * as TypesService from '../../services/types-service';
import * as RulesService from './rules-utils';
import ErrorHandler from '../common/ErrorHandler';
import JPadVisualEditor from './JPadVisualEditor/JPadVisualEditor';
import JPadTextEditor from './JPadTextEditor/JPadTextEditor';
import './JPadFullEditor.css';

const confirmUnsavedAlert = {
  title: 'Warning',
  message: 'You have un-inserted changes.\nAre you sure you want to leave?',
};

const MutatorFor = propName => Comp =>
  class extends React.Component {
    constructor() {
      super();
      this.state = {};
    }
    componentWillMount() {
      this.setState({
        mutator: Mutator.stateless(() => this.props[propName], this.props.onMutation),
      });
    }
    render() {
      const { [propName]: _, ...otherProps } = this.props;
      return <Comp mutate={this.state.mutator} {...otherProps} />;
    }
  };

const KeyRulesEditor = ({
  keyPath,
  source,
  valueType,
  mutate,
  onMutation,
  alerter,
  isReadonly,
  selectedTab,
  onTabSelected,
  hasChanges,
  setHasChanges,
}) => (
  <div className="key-rules-editor-container" data-comp="key-rules-editor" disabled={isReadonly}>
    <Tabs
      className="tab-container"
      selectedIndex={selectedTab}
      onSelect={async (index, lastIndex) => {
        if (
          lastIndex === 1 &&
          hasChanges &&
          !(await alerter.showConfirm(confirmUnsavedAlert)).result
        )
          return true;
        setHasChanges(false);
        onTabSelected(index);
      }}
    >
      <TabList>
        <Tab className="tab-header">
          <label className="key-definition-tab-icon"> </label>
          <label className="tab-title" data-tab-header="rules">
            Rules
          </label>
        </Tab>
        <Tab className="tab-header">
          <label className="key-source-tab-icon"> </label>
          <label className="tab-title" data-tab-header="source">
            Source
          </label>
        </Tab>
      </TabList>
      <TabPanel className="tab-content">
        <ErrorHandler errorMessage="Rules Editor does not support this format yet, please use Source instead">
          <fieldset disabled={isReadonly} style={{ border: 'none' }}>
            <JPadVisualEditor {...{ mutate, alerter, valueType, keyPath }} jpadSource={source} />
          </fieldset>
        </ErrorHandler>
      </TabPanel>
      <TabPanel className="tab-content">
        <JPadTextEditor
          {...{ source, isReadonly, setHasChanges }}
          onChange={x => onMutation(JSON.parse(x))}
        />
      </TabPanel>
    </Tabs>
  </div>
);

function getTypedValue(value, valueType) {
  try {
    return TypesService.convertValue(value, valueType);
  } catch (err) {
    return valueType === TypesService.types.boolean.name ? '' : `${value}`;
  }
}

function changeValueType(valueType, rulesMutate, depth) {
  const rules = rulesMutate.getValue();
  if (depth === 0) {
    for (let i = 0; i < rules.length; i++) {
      const ruleMutate = rulesMutate.in(i);

      const valueDistrubtion = ruleMutate.in('ValueDistribution').getValue();
      if (!valueDistrubtion) {
        const currentRuleValue = ruleMutate.in('Value').getValue();
        ruleMutate.in('Value').updateValue(getTypedValue(currentRuleValue, valueType));
        break;
      }

      const valueToConvert =
        valueDistrubtion.type === 'weighted' ? Object.keys(valueDistrubtion.args)[0] : '';
      const convertedValue = getTypedValue(valueToConvert, valueType);

      ruleMutate
        .in('ValueDistribution')
        .delete()
        .in('OwnerType')
        .delete()
        .in('Type')
        .updateValue('SingleVariant')
        .up()
        .insert('Value', convertedValue);
    }
    return;
  }

  Object.keys(rules).forEach(key => changeValueType(valueType, rulesMutate.in(key), depth - 1));
}

const JPadFullEditor = compose(
  mapProps(({ source, onDependencyChanged, dependencies, onChange, ...other }) => ({
    onMutation(sourceTree) {
      const newDependencies = RulesService.getDependencies(
        sourceTree.rules,
        sourceTree.partitions.length,
      );
      if (!R.equals(dependencies, newDependencies)) {
        onDependencyChanged(newDependencies);
      }
      onChange(JSON.stringify(sourceTree, null, 4));
    },
    source,
    sourceTree: RulesService.convertToExplicitKey(JSON.parse(source)),
    ...other,
  })),
  MutatorFor('sourceTree'),
  withState('selectedTab', 'onTabSelected', 0),
  withState('hasChanges', 'setHasChanges', false),
  pure,
  lifecycle({
    componentWillReceiveProps({ valueType, mutate }) {
      const currentValueType = mutate.in('valueType').getValue();
      if (valueType === currentValueType) return;

      const currentDefaultValue = mutate.in('defaultValue').getValue();

      mutate.apply((m) => {
        m.in('valueType').updateValue(valueType);
        if (currentDefaultValue !== undefined) {
          const modifiedDefaultValue = getTypedValue(currentDefaultValue, valueType);
          m.in('defaultValue').updateValue(modifiedDefaultValue);
        }
        changeValueType(valueType, m.in('rules'), m.in('partitions').getValue().length);
        return m;
      });
    },
  }),
)(KeyRulesEditor);

JPadFullEditor.displayName = 'JPadFullEditor';

export default JPadFullEditor;
