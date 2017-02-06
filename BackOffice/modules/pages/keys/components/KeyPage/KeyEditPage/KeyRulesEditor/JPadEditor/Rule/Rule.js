import React from 'react';
import R from 'ramda';
import { shouldUpdate } from 'recompose';
import style from './Rule.css';
import Matcher from '../Matcher/Matcher';
import RuleValue from '../RuleValue/RuleValue';
import classNames from 'classnames';

const ruleHasChanged = (props, nextProps) =>
  props.valueType !== nextProps.valueType ||
  !R.equals(props.rule, nextProps.rule) ||
  !R.equals(props.mutate.path, nextProps.mutate.path);

const comp = ({ rule, valueType, mutate, autofocus, schema }) => {
  const isDefaultValue = Object.keys(rule.Matcher).length === 0;

  let valueTitle = isDefaultValue ? 'Default ' : '';
  valueTitle += rule.Type === 'SingleVariant' ? 'Value' : 'Values';

  return (
    <div className={classNames(style['rule-container'], { [style['default-value']]: isDefaultValue })}>
      {!isDefaultValue ?
        <div className={style['conditions']}>
          <label className={style['rule-partial-title']}>Conditions</label>
          <Matcher matcher={rule.Matcher} schema={schema} mutate={mutate.in('Matcher')} autofocus={autofocus} />
        </div> : null
      }
      <div className={style['values']} >
        <label className={style['rule-partial-title']}>{valueTitle}</label>
        <RuleValue {...{ rule, mutate, valueType, schema }} autofocus={isDefaultValue && autofocus} />
      </div>
    </div>
  );
};

export default shouldUpdate(ruleHasChanged)(comp);

