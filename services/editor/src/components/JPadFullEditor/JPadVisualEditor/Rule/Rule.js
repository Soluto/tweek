import React from 'react';
import * as R from 'ramda';
import { shouldUpdate } from 'recompose';
import Matcher from '../Matcher/Matcher';
import RuleValue from '../RuleValue/RuleValue';
import * as ContextService from '../../../../services/context-service';
import './Rule.css';

const ruleHasChanged = (props, nextProps) =>
  props.valueType !== nextProps.valueType ||
  !R.equals(props.rule, nextProps.rule) ||
  !R.equals(props.mutate.path, nextProps.mutate.path);

const Rule = ({ rule, valueType, mutate, autofocus, keyPath }) => {
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
        <RuleValue {...{ rule, mutate, valueType, identities, keyPath }} />
      </div>
    </div>
  );
};

export default shouldUpdate(ruleHasChanged)(Rule);
