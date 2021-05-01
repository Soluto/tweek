import React from 'react';
import ComboBox from '../../../../common/ComboBox/ComboBox';
import './styles.css';

const Operator = ({ selectedOperator, onUpdate, supportedOperators }) => (
  <ComboBox
    className={'matcher-operator'}
    suggestions={supportedOperators.map((op) => ({ value: op.operatorValue, label: op.label }))}
    filterBy={() => true}
    onChange={(_, selected) => {
      if (!selected || selected.value === '') return;
      onUpdate(supportedOperators.find((x) => x.operatorValue === selected.value));
    }}
    value={selectedOperator && selectedOperator.label}
  />
);

export default Operator;
