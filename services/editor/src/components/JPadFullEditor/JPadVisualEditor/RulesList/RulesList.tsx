import React, { useState } from 'react';
import { ValueType } from 'tweek-client';
import { AnyMutator } from '../../../../utils/mutator';
import { Alerter } from '../../../alerts/types';
import { ConditionValueType, Rule as RuleType } from '../../types';
import Rule from '../Rule/Rule';
import './RulesList.css';

const deleteRuleAlert = {
  title: 'Warning',
  message: 'Are you sure you want to delete this rule?',
};

export type RulesListProps = {
  mutate: AnyMutator<RuleType[], []>;
  valueType: ValueType;
  alerter: Alerter;
};

const RulesList = ({ mutate, valueType, alerter }: RulesListProps) => {
  const [autofocusRuleIndex, setAutofocusRuleIndex] = useState(-1);

  const rules = mutate.getValue();
  if (!rules) {
    return <div />;
  }

  const addMutatorRule = () => {
    mutate.prepend({
      Matcher: { '': '' },
      Value: valueType.emptyValue || '',
      Type: ConditionValueType.SingleVariant,
    });
    setAutofocusRuleIndex(0);
  };

  const deleteRule = async (ruleIndex: number) => {
    setAutofocusRuleIndex(-1);
    if ((await alerter.showConfirm(deleteRuleAlert)).result) {
      mutate.in(ruleIndex).delete();
    }
  };

  return (
    <div className="rule-item-container" data-comp="rules-list">
      <button className="add-rule-button" data-comp="add-rule" onClick={addMutatorRule}>
        Add Rule
      </button>

      {rules.map((rule, i) => (
        <div className="conditions-container" data-comp="rule" key={rules.length - i}>
          <div className="rule-control-wrapper">
            {i > 0 && (
              <button
                className="rule-order-button"
                onClick={() => mutate.replaceKeys(i, i - 1)}
                title="Move up"
              >
                
              </button>
            )}
            {i < rules.length - 1 && (
              <button
                className="rule-order-button"
                onClick={() => mutate.replaceKeys(i, i + 1)}
                title="Move down"
              >
                
              </button>
            )}
            <button
              className="delete-rule-button"
              data-comp="delete-rule"
              onClick={() => deleteRule(i)}
              title="Remove rule"
            />
          </div>

          <Rule
            key={i}
            mutate={mutate.in(i)}
            rule={rule}
            valueType={valueType}
            autofocus={i === autofocusRuleIndex}
          />
        </div>
      ))}
    </div>
  );
};

export default RulesList;
