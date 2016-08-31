import R from 'ramda';
import React from 'react';
import style from './styles.css';
import Typeahead from 'react-bootstrap-typeahead';

let equalityOps = { '$eq': '=', '$ne': '!=' };
let comparisonOps = { '$ge': '>=', '$gt': '>', '$lt': '<', '$le': '<=', ...equalityOps };
let groupOps = { '$in': 'in' };

export const getSupportedOperators = (meta) => {
  let ops = (meta.type.bool && meta.allowedValues) ? equalityOps : comparisonOps;
  if (meta.multipleValues) ops = { ...ops, ...groupOps };
  return ops;
};

export const Operator = ({ selectedOp, onUpdate, supportedOperators }) => {
  return (
    <div className={style['matcher-operator']}>
      <Typeahead
        options={ R.keys(supportedOperators).map(op => ({ value: op, label: supportedOperators[op] })) }
        onChange={(selectedValues) => {
          if (selectedValues.length < 1) return;
          onUpdate(selectedValues[0].value);
        } }
        selected={ [
          {
            label: supportedOperators[selectedOp],
            value: selectedOp,
          },
        ] }
      />
    </div>
  );
};
