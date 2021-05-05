import * as R from 'ramda';
import React, { useEffect, useRef, useState } from 'react';
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs';
import { ValueType } from 'tweek-client';
import * as TypesService from '../../services/types-service';
import Mutator from '../../utils/mutator';
import { Alerter } from '../alerts/types';
import { ErrorHandler } from '../common';
import './JPadFullEditor.css';
import JPadTextEditor from './JPadTextEditor/JPadTextEditor';
import JPadVisualEditor from './JPadVisualEditor/JPadVisualEditor';
import * as RulesService from './rules-utils';
import { Jpad, JpadRules, ValueDistribution } from './types';

const confirmUnsavedAlert = {
  title: 'Warning',
  message: 'You have un-inserted changes.\nAre you sure you want to leave?',
};

class MutatorRef<T> {
  readonly mutate = Mutator.stateless(
    () => this.target,
    (x) => this.onMutation(x),
  );

  constructor(public target: T, public onMutation: (t: T) => void) {}
}

const useMutator = <T,>(target: T, onMutation: (t: T) => void) => {
  const ref = useRef(new MutatorRef(target, onMutation));

  ref.current.target = target;
  ref.current.onMutation = onMutation;

  return ref.current.mutate;
};

export type JPadFullEditorProps = {
  source: string;
  valueType: ValueType;
  onDependencyChanged: (deps: string[]) => void;
  dependencies: string[];
  onChange: (source: string) => void;
  alerter: Alerter;
  isReadonly?: boolean;
};

const JPadFullEditor = ({
  source,
  valueType,
  onDependencyChanged,
  dependencies,
  onChange,
  alerter,
  isReadonly,
}: JPadFullEditorProps) => {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [selectedTab, onTabSelected] = useState(0);

  const sourceTree = RulesService.convertToExplicitKey(JSON.parse(source));
  const onMutation = (sourceTree: Jpad) => {
    const newDependencies = RulesService.getDependencies(
      sourceTree.rules,
      sourceTree.partitions.length,
    );
    if (!R.equals(dependencies, newDependencies)) {
      onDependencyChanged(newDependencies);
    }
    onChange(JSON.stringify(sourceTree, null, 4));
  };
  const mutate = useMutator(sourceTree, onMutation);

  const jpadValueType = mutate.in('valueType').getValue();
  const valueTypeName = valueType.name!;

  useEffect(() => {
    if (valueTypeName === jpadValueType) {
      return;
    }

    const currentDefaultValue = mutate.in('defaultValue').getValue();

    mutate.apply((m) => {
      m.in('valueType').updateValue(valueTypeName);
      if (currentDefaultValue !== undefined) {
        const modifiedDefaultValue = getTypedValue(currentDefaultValue, valueTypeName);
        m.in('defaultValue').updateValue(modifiedDefaultValue);
      }
      changeValueType(valueTypeName, m.in('rules') as any, m.in('partitions').getValue().length);
      return m;
    });
  }, [valueTypeName, jpadValueType]); //eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="key-rules-editor-container" data-comp="key-rules-editor">
      <Tabs
        className="tab-container"
        selectedIndex={selectedTab}
        onSelect={(index, lastIndex) => {
          Promise.resolve(
            lastIndex === 1 &&
              hasUnsavedChanges &&
              alerter.showConfirm(confirmUnsavedAlert).then((t) => !t.result),
          ).then((t) => {
            if (t) {
              return;
            }

            setHasUnsavedChanges(false);
            onTabSelected(index);
          });
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
              <JPadVisualEditor mutate={mutate} alerter={alerter} valueType={valueType} />
            </fieldset>
          </ErrorHandler>
        </TabPanel>
        <TabPanel className="tab-content">
          <JPadTextEditor
            source={source}
            isReadonly={isReadonly}
            setHasUnsavedChanges={setHasUnsavedChanges}
            onChange={(x) => onMutation(JSON.parse(x))}
          />
        </TabPanel>
      </Tabs>
    </div>
  );
};

function getTypedValue(value: any, valueType: string | ValueType) {
  try {
    return TypesService.convertValue(value, valueType);
  } catch (err) {
    return valueType === TypesService.types.boolean.name ? '' : `${value}`;
  }
}

function changeValueType(
  valueType: string | ValueType,
  rulesMutate: Mutator<JpadRules>,
  depth: number,
) {
  const rules = rulesMutate.getValue();
  if (depth === 0) {
    for (let i = 0; i < rules.length; i++) {
      const ruleMutate = rulesMutate.in(i);

      const valueDistribution = ruleMutate.in('ValueDistribution').getValue() as ValueDistribution;
      if (!valueDistribution) {
        const currentRuleValue = ruleMutate.in('Value').getValue();
        ruleMutate.in('Value').updateValue(getTypedValue(currentRuleValue, valueType));
        break;
      }

      const valueToConvert =
        valueDistribution.type === 'weighted' ? Object.keys(valueDistribution.args)[0] : '';
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

  Object.keys(rules).forEach((key) =>
    changeValueType(valueType, rulesMutate.in(key) as any, depth - 1),
  );
}

export default JPadFullEditor;
