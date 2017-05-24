import R from 'ramda';
import React from 'react';
import style from './styles.css';
import ComboBox from '../../../../../components/common/ComboBox/ComboBox';

export const Operator = ({ selectedOperator, onUpdate, supportedOperators }) => {
  const props = {};
  if (!!selectedOperator) props['selected'] = [{
    label: selectedOperator.label,
    value: selectedOperator.operatorValue,
  }];

  return (
    <ComboBox
      options={supportedOperators.map(op => ({ value: op.operatorValue, label: op.label }))}
      wrapperThemeClass={style['matcher-operator']}
      onChange={(selected) => {
        if (selected.value === '') return;
        onUpdate(supportedOperators.find(x => x.operatorValue === selected.value));
      }}
      {...props}
    />
  );
};
