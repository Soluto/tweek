import R from 'ramda';
import React from 'react';
import ClosedComboBox from '../../../../../components/common/ClosedComboBox';
let equalityOps = { '$eq': '=', '$ne': '!=' };
let comparisonOps = { '$ge': '>=', '$gt': '>', '$lt': '<', '$le': '<=', ...equalityOps };

export const getSupportedOps = (meta) => {
  if (meta.type.bool) return equalityOps;
  if (meta.allowedValues) return equalityOps;
  return comparisonOps;
};


export const MatcherOp = ({ selectedOp, onUpdate, supportedOps }) =>
(<div className="MatcherOp">
            <ClosedComboBox className="OpDropdown"
              inputProps={{ onChange:
             ({ value }) => {
               onUpdate(value);
             }, value: supportedOps[selectedOp] }}
              suggestions={R.keys(supportedOps).map(op => ({ value: op, label: supportedOps[op] }))}
            />
         </div>);
