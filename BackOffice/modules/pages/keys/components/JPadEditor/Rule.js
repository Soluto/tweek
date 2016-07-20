import React from 'react';
import R from 'ramda';
import { shouldUpdate } from 'recompose';
import { Rule as RuleStyle,
        Panel as PanelStyle } from './JPadEditor.css';
import Matcher from './Matcher';
import RuleValue from './RuleValue';

const ruleHasChanged = (props, nextProps) =>
  !R.equals(props.rule, nextProps.rule) ||
  !R.equals(props.mutate.path, nextProps.mutate.path);

const comp = ({ rule, mutate }) => {
  return (<div className={RuleStyle}>
       <div className={PanelStyle} data-label="Conditions">
            <Matcher matcher={rule.Matcher} mutate={mutate.in('Matcher')} />
            </div>
       <div className={PanelStyle} style={{ 'flexGrow': 0.2 }} data-label="Values">
       <RuleValue {...{ rule, mutate }} />
       </div>
    </div>);
};

export default shouldUpdate(ruleHasChanged)(comp);

