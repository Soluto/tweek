import * as R from 'ramda';
import React from 'react';
import { ValueType } from 'tweek-client';
import { AnyMutator } from '../../../utils/mutator';
import { Alerter } from '../../alerts/types';
import * as RulesService from '../rules-utils';
import { AuthPartitionTest } from '../rules-utils';
import { Jpad, JpadRules } from '../types';
import './JPadVisualEditor.css';
import PartitionsSelector from './Partition/PartitionsSelector';
import PartitionsList from './PartitionsList/PartitionsList';
import DefaultValue from './Rule/DefaultValue';
import RulesList from './RulesList/RulesList';

const resetPartitionsAlert = {
  title: 'Warning',
  message: 'If you change the partitions the rules will be reset.\nDo you want to continue?',
};

const autoPartitionAlert = (testAutoPartition: AuthPartitionTest) => ({
  title: 'Warning',
  message: `Auto-partition can move ${testAutoPartition.match} rules to matching partitions, and ${testAutoPartition.default} rules to default partition/s.\n
          This can cause some side effects related to rule ordering.\n
          Do you want to use auto-partition, or prefer to delete all rules?`,
  buttons: [
    {
      text: 'Auto-partition',
      value: 'OK',
      className: 'auto-partition-btn',
      'data-alert-button': 'auto-partition',
    },
    {
      text: 'Reset',
      value: 'RESET',
      className: 'reset-partitions-btn',
      'data-alert-button': 'reset',
    },
    {
      text: 'Cancel',
      value: 'CANCEL',
      className: 'rodal-cancel-btn',
      'data-alert-button': 'cancel',
    },
  ],
});

function createPartitionedRules(depth: number): JpadRules {
  return depth === 0 ? [] : {};
}

function isEmptyRules(rules: JpadRules): boolean {
  if (!rules) {
    return true;
  }
  if (Array.isArray(rules)) {
    return rules.length === 0;
  }
  if (Object.keys(rules).some((k) => k !== '*')) {
    return false;
  }
  return isEmptyRules(rules['*']);
}

export type JPadVisualEditorProps = {
  valueType: ValueType;
  mutate: AnyMutator<Jpad>;
  alerter: Alerter;
};

const JPadVisualEditor = ({ valueType, mutate, alerter }: JPadVisualEditorProps) => {
  const partitions = mutate.in('partitions').getValue();
  const defaultValueMutate = mutate.in('defaultValue');

  const handlePartitionAddition = async (newPartition: string) => {
    const rules = mutate.in('rules').getValue();
    const testAutoPartition = RulesService.testAutoPartition(
      newPartition,
      rules,
      partitions.length,
    );

    if (!testAutoPartition.isValid || isEmptyRules(mutate.in('rules').getValue())) {
      const newPartitions = partitions.concat(newPartition);
      await clearPartitions(newPartitions);
      return;
    }

    const alertResult = (await alerter.showCustomAlert(autoPartitionAlert(testAutoPartition)))
      .result;

    switch (alertResult) {
      case 'RESET':
        mutate.apply((m) =>
          m
            .insert('rules', createPartitionedRules(partitions.length + 1))
            .in('partitions')
            .append(newPartition),
        );
        break;
      case 'OK':
        mutate.apply((m) =>
          m
            .insert('rules', RulesService.addPartition(newPartition, rules, partitions.length))
            .in('partitions')
            .append(newPartition),
        );
        break;
      default:
        break;
    }
  };

  const handlePartitionDelete = async (index: number) => {
    if (partitions.length === 0) {
      return;
    }
    const newPartitions = R.remove(index, 1, partitions);
    await clearPartitions(newPartitions);
  };

  const clearPartitions = async (newPartitions: string[]) => {
    if (
      isEmptyRules(mutate.in('rules').getValue()) ||
      (await alerter.showConfirm(resetPartitionsAlert)).result
    ) {
      mutate.apply((m) =>
        m
          .insert('partitions', newPartitions)
          .insert('rules', createPartitionedRules(newPartitions.length)),
      );
    }
  };

  const updateDefaultValue = (newValue: any) => {
    if (newValue === undefined || newValue === '') {
      defaultValueMutate.delete();
    } else {
      defaultValueMutate.updateValue(newValue);
    }
  };

  return (
    <div className={'jpad-editor-container'}>
      <div className={'jpad-settings'}>
        <DefaultValue
          value={defaultValueMutate.getValue()}
          valueType={valueType}
          onChange={updateDefaultValue}
          className={'default-value'}
        />
        <div className={'vertical-separator'} />
        <PartitionsSelector
          partitions={partitions}
          handlePartitionAddition={handlePartitionAddition}
          handlePartitionDelete={handlePartitionDelete}
          alerter={alerter}
        />
      </div>

      {partitions && partitions.length > 0 ? (
        <PartitionsList
          partitions={partitions}
          valueType={valueType}
          alerter={alerter}
          mutate={mutate.in('rules') as any}
        />
      ) : (
        <RulesList valueType={valueType} alerter={alerter} mutate={mutate.in('rules') as any} />
      )}
    </div>
  );
};

export default JPadVisualEditor;
