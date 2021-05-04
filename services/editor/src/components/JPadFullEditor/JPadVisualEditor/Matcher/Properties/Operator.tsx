import React from 'react';
import { Operator as OperatorType } from '../../../../../services/operators-provider';
import { ComboBox } from '../../../../common';
import './styles.css';

export type OperatorProps = {
  selectedOperator: OperatorType<string>;
  supportedOperators: OperatorType<string>[];
  onUpdate: (op: OperatorType<string>) => void;
};

const Operator = ({ selectedOperator, onUpdate, supportedOperators }: OperatorProps) => (
  <ComboBox
    className={'matcher-operator'}
    suggestions={supportedOperators}
    filterBy={() => true}
    onChange={(_, selected) => selected && onUpdate(selected)}
    value={selectedOperator && selectedOperator.label}
  />
);

export default Operator;
