import React from 'react';
import R from 'ramda';
import { shouldUpdate } from 'recompose';
import style from './Rule.css';
import Matcher from '../Matcher/Matcher';
import RuleValue from '../RuleValue/RuleValue';

const ruleHasChanged = (props, nextProps) =>
  !R.equals(props.rule, nextProps.rule) ||
  !R.equals(props.mutate.path, nextProps.mutate.path);

const comp = ({ rule, mutate }) => {
  return (
    <div className={style['rule-container']}>
      <div className={style['conditions']}>
        <label className={style['case-partial-title']}>Conditions</label>
        <Matcher matcher={rule.Matcher} mutate={mutate.in('Matcher') } />
      </div>
      <div className={style['values']} >
        <label className={style['case-partial-title']}>Values</label>
        <RuleValue {...{ rule, mutate }} />
      </div >
    </div >
  );
};

export default shouldUpdate(ruleHasChanged)(comp);

