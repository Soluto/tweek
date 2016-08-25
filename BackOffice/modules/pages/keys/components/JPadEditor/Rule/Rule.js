import React from 'react';
import R from 'ramda';
import { shouldUpdate } from 'recompose';
import style from './Rule.css';
import Matcher from '../Matcher/Matcher';
import RuleValue from '../RuleValue/RuleValue';
import classNames from 'classnames';

const ruleHasChanged = (props, nextProps) =>
  !R.equals(props.rule, nextProps.rule) ||
  !R.equals(props.mutate.path, nextProps.mutate.path);

const comp = ({ rule, mutate }) => {
  const isDefaultValue = Object.keys(rule.Matcher).length === 0;
  
  let valueTitle = isDefaultValue ? 'Default V' : 'V';
  valueTitle += rule.Type === 'SingleVariant' ? 'alue' : 'alues';

  return (
    <div className={classNames(style['rule-container'], { [style['default-value']]: isDefaultValue }) }>
      { !isDefaultValue ?
        <div className={style['conditions']}>
          <label className={style['case-partial-title']}>Conditions</label>
          <Matcher matcher={rule.Matcher} mutate={mutate.in('Matcher') } />
        </div> : null
      }
      <div className={style['values']} >
        <label className={style['case-partial-title']}>{valueTitle}</label>
        <RuleValue {...{ rule, mutate }} autofocus={isDefaultValue} />
      </div >
    </div >
  );
};

export default shouldUpdate(ruleHasChanged)(comp);

