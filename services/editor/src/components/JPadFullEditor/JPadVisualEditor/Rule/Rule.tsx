import * as R from 'ramda';
import React, { memo } from 'react';
import { ValueType } from 'tweek-client';
import * as ContextService from '../../../../services/context-service';
import { AnyMutator } from '../../../../utils/mutator';
import { Rule as RuleType } from '../../types';
import Matcher from '../Matcher/Matcher';
import RuleValue from '../RuleValue/RuleValue';
import './Rule.css';

export type RuleProps = {
  rule: RuleType;
  valueType: ValueType;
  mutate: AnyMutator<RuleType[], [number]>;
  autofocus?: boolean;
};

const Rule = ({ rule, valueType, mutate, autofocus }: RuleProps) => {
  const valueTitle = rule.Type === 'SingleVariant' ? 'Value' : 'Values';
  const identities = ContextService.getIdentities();

  return (
    <div className="rule-container">
      <div className="conditions">
        <label className="rule-partial-title">Conditions</label>
        <Matcher matcher={rule.Matcher} mutate={mutate.in('Matcher')} autofocus={autofocus} />
      </div>
      <div className="values">
        <label className="rule-partial-title">{valueTitle}</label>
        <RuleValue rule={rule} mutate={mutate} valueType={valueType} identities={identities} />
      </div>
    </div>
  );
};

export default memo(
  Rule,
  (props: RuleProps, nextProps: RuleProps) =>
    props.valueType === nextProps.valueType &&
    R.equals(props.rule, nextProps.rule) &&
    R.equals(props.mutate.path, nextProps.mutate.path),
);
