import React from 'react';
import style from './styles.css';
import ComboBox from '../../../../../../../../../components/common/ComboBox/ComboBox';

const Operator = ({ selectedOperator, onUpdate, supportedOperators }) => (
  <ComboBox
    className={style['matcher-operator']}
    suggestions={supportedOperators.map(op => ({ value: op.operatorValue, label: op.label }))}
    onChange={(_, selected) => {
      if (!selected || selected.value === '') return;
      onUpdate(supportedOperators.find(x => x.operatorValue === selected.value));
    }}
    value={selectedOperator && ({ label: selectedOperator.label, value: selectedOperator.operatorValue })}
  />
);

export default Operator;
