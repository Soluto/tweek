import React from 'react';
import * as R from 'ramda';
import * as TypesService from '../../../services/types-service';
import * as RulesService from '../rules-utils';
import PartitionsSelector from './Partition/PartitionsSelector';
import RulesList from './RulesList/RulesList';
import DefaultValue from './Rule/DefaultValue';
import PartitionsList from './PartitionsList/PartitionsList';
import './JPadVisualEditor.css';

const resetPartitionsAlert = {
  title: 'Warning',
  message: 'If you change the partitions the rules will be reset.\nDo you want to continue?',
};

const autoPartitionAlert = testAutoPartition => ({
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

function createPartitionedRules(depth) {
  return depth === 0 ? [] : {};
}

function isEmptyRules(rules) {
  if (!rules) return true;
  if (Array.isArray(rules)) return rules.length === 0;
  if (Object.keys(rules).some(k => k !== '*')) return false;
  return isEmptyRules(rules['*']);
}

export default ({ valueType, mutate, alerter, keyPath }) => {
  const partitions = mutate.in('partitions').getValue();
  const defaultValueMutate = mutate.in('defaultValue');

  const handlePartitionAddition = async (newPartition) => {
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
      mutate.apply(m =>
        m
          .insert('rules', createPartitionedRules(partitions.length + 1))
          .in('partitions')
          .append(newPartition),
      );
      break;
    case 'OK':
      mutate.apply(m =>
        m
          .insert('rules', RulesService.addPartition(newPartition, rules, partitions.length))
          .in('partitions')
          .append(newPartition),
      );
      break;
    }
  };
  const handlePartitionDelete = async (index) => {
    if (partitions.length === 0) return;
    const newPartitions = R.remove(index, 1, partitions);
    await clearPartitions(newPartitions);
  };
  const clearPartitions = async (newPartitions) => {
    if (
      isEmptyRules(mutate.in('rules').getValue()) ||
      (await alerter.showConfirm(resetPartitionsAlert)).result
    ) {
      mutate.apply(m =>
        m
          .insert('partitions', newPartitions)
          .insert('rules', createPartitionedRules(newPartitions.length)),
      );
    }
  };
  const updateDefaultValue = (newValue) => {
    const typedValue = newValue && TypesService.safeConvertValue(newValue, valueType);
    if (typedValue === undefined || typedValue === '') {
      defaultValueMutate.delete();
    } else {
      defaultValueMutate.updateValue(typedValue);
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
          {...{ partitions, handlePartitionAddition, handlePartitionDelete, alerter }}
        />
      </div>

      {partitions && partitions.length > 0 ? (
        <PartitionsList
          {...{ partitions, valueType, alerter, keyPath }}
          mutate={mutate.in('rules')}
        />
      ) : (
        <RulesList {...{ valueType, alerter, keyPath }} mutate={mutate.in('rules')} />
      )}
    </div>
  );
};
