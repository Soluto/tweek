import React from 'react';
import R from 'ramda';
import PartitionsSelector from './Partition/PartitionsSelector';
import RulesList from './RulesList/RulesList';
import DefaultValue from './Rule/DefaultValue';
import PartitionsList from './PartitionsList/PartitionsList';
import * as RulesService from '../../../../../../../services/rules-service';
import * as TypesService from '../../../../../../../services/types-service';
import style from './JPadEditor.css';

const isBrowser = typeof (window) === 'object';

function createPartitionedRules(depth) {
  if (depth == 0) return [];
  return {"*": createPartitionedRules(depth - 1)};
}

function isEmptyRules(rules) {
  if (!rules) return true;
  if (Array.isArray(rules)) return rules.length == 0;
  if (Object.keys(rules).some(k => k != '*')) return false;
  return isEmptyRules(rules['*']);
}

export default ({valueType, mutate, showConfirm, showAlert, showCustomAlert}) => {
  if (!isBrowser)
    return (<div>Loading rule...</div>);

  const partitions = mutate.in("partitions").getValue();
  const defaultValueMutate = mutate.in("defaultValue");

  const handlePartitionAddition = (newPartition) => {
    const rules = mutate.in("rules").getValue();
    const testAutoPartition = RulesService.testAutoPartition(newPartition, rules, partitions.length);

    if (!testAutoPartition.isValid) {
      const newPartitions = partitions.concat(newPartition);
      clearPartitions(newPartitions);
      return;
    }

    showCustomAlert({
      shouldShow: !isEmptyRules(mutate.in("rules").getValue()),
      title: 'Warning',
      message: `Auto-partition can move ${testAutoPartition.match} rules to matching partitions, and ${testAutoPartition.default} rules to default partition/s.\n
          This can cause some side effects related to rule ordering.\n
          Do you want to use auto-partition, or prefer to delete all rules?`,
      buttons: [{
        text: 'Auto-partition',
        value: 'OK',
        className: 'rodal-confirm-btn',
      }, {
        text: 'Reset',
        value: 'RESET',
        className: 'reset-partitions',
      }, {
        text: 'Cancel',
        value: 'CANCEL',
        className: 'cancel-reset-partitions',
      }],
      onResult: (result) => {
        switch (result) {
          case 'RESET':
            mutate.apply(m => m.insert('rules', createPartitionedRules(partitions.length + 1)).in('partitions').append(newPartition));
            break;
          case 'OK':
            mutate.apply(m => m.insert("rules", RulesService.addPartition(newPartition, rules, partitions.length)).in("partitions").append(newPartition));
            break;
        }
      }
    });
  };

  const handlePartitionDelete = (index) => {
    if (partitions.length === 0) return;
    const newPartitions = R.remove(index, 1, partitions);
    clearPartitions(newPartitions);
  };

  const clearPartitions = (newPartitions) => {
    showConfirm({
      shouldShow: !isEmptyRules(mutate.in("rules").getValue()),
      title: 'Warning',
      message: 'If you change the partitions the rules will be reset.\nDo you want to continue?',
      onResult: (result) => {
        if (!result) return;
        mutate.apply(m => m.insert("partitions", newPartitions).insert("rules", createPartitionedRules(newPartitions.length)));
      }
    });
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
    <div className={style['jpad-editor-container']}>
      <div className={style['jpad-settings']}>
        <DefaultValue
          value={defaultValueMutate.getValue()}
          valueType={valueType}
          onChange={updateDefaultValue}
        />
        <div className={style['vertical-separator']}></div>
        <PartitionsSelector {...{partitions, handlePartitionAddition, handlePartitionDelete, showAlert}} />
      </div>

      {
        partitions && partitions.length > 0
          ? <PartitionsList {...{partitions, valueType, showConfirm}} mutate={mutate.in("rules")}/>
          : <RulesList {...{valueType, showConfirm}} mutate={mutate.in("rules")}/>
      }
    </div>
  );
}