import R from 'ramda';
import React from 'react';
import ClosedComboBox from '../../../../../../components/common/ClosedComboBox';
import style from './styles.css';

let equalityOps = { '$eq': '=', '$ne': '!=' };
let comparisonOps = { '$ge': '>=', '$gt': '>', '$lt': '<', '$le': '<=', ...equalityOps };

export const getSupportedOperators = (meta) => {
  if (meta.type.bool) return equalityOps;
  if (meta.allowedValues) return equalityOps;
  return comparisonOps;
};

export const Operator = ({ selectedOp, onUpdate, supportedOperators }) => (
  <div className={style['MatcherOp']}>
    <ClosedComboBox 
      inputProps={{ onChange: ({ value }) => { onUpdate(value); }, value: supportedOperators[selectedOp] }}
      suggestions={R.keys(supportedOperators).map(op => ({ value: op, label: supportedOperators[op] })) }
      />
  </div>
);
