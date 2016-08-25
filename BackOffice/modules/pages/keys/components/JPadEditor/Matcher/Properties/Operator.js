import R from 'ramda';
import React from 'react';
import ClosedComboBox from '../../../../../../components/common/ClosedComboBox/ClosedComboBox';
import style from './styles.css';

let equalityOps = { '$eq': '=', '$ne': '!=' };
let comparisonOps = { '$ge': '>=', '$gt': '>', '$lt': '<', '$le': '<=', ...equalityOps };
let groupOps = { '$in': 'in' };

export const getSupportedOperators = (meta) => {
  let ops = (meta.type.bool && meta.allowedValues) ? equalityOps : comparisonOps;
  if (meta.multipleValues) ops = { ...ops, ...groupOps };
  return ops;
};

export const Operator = ({ selectedOp, onUpdate, supportedOperators }) => (
  <div className={style['matcher-operator']}>
    <ClosedComboBox
      inputProps={{ onChange: ({ value }) => { onUpdate(value); }, value: supportedOperators[selectedOp] }}
      suggestions={R.keys(supportedOperators).map(op => ({ value: op, label: supportedOperators[op] })) }
    />
  </div>
);
