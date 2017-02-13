import React from 'react';
import R from 'ramda';
import { Operator, getSupportedOperators } from './Operator';
import PropertyValue from './PropertyValue';
import * as ContextService from "../../../../../../../../../services/context-service";

const isValueType = (value) => R.isArrayLike(value) || typeof (value) !== 'object';

let BinaryPredicate = ({onValueUpdate, onOpUpdate, op, typeDetails, value}) => {
  return (
    <div style={{ display: 'flex' }}>
      <Operator onUpdate={onOpUpdate} supportedOperators={getSupportedOperators(typeDetails)} selectedOp={op} />
      <PropertyValue {...{ typeDetails, value, onUpdate: onValueUpdate, op }} />
    </div>
  );
};

let translateValue = (oldOp, newOp, value) => {
  if (oldOp === '$in') return value.length === 1 ? value[0] : '';
  if (newOp === '$in') return value === '' ? [] : [value];
  return value;
};

let ShortPredicate = ({typeDetails, mutate, value}) => {
  return (
    <BinaryPredicate
      onValueUpdate={mutate.updateValue}
      onOpUpdate={selectedOp => {
        if (selectedOp === '$eq') return;
        mutate.updateValue({
          [selectedOp]: translateValue('$eq', selectedOp, value),
          ...(typeDetails.comparer ? { $compare: typeDetails.comparer } : {}),
        });
      }}
      op="$eq"
      {...{ value, typeDetails } }
    />
  );
};

let ComplexPredicate = ({predicate, mutate, property, typeDetails}) => {
  return (
    <div style={{ display: 'flex' }}>{
      R.flatten(R.toPairs(predicate)
        .filter(([key]) => key[0] === '$')
        .filter(([op]) => op !== '$compare')
        .map(([op, value]) =>
          (isValueType(value)) ?
            <BinaryPredicate key={op}
              onOpUpdate={selectedOp => {
                const newValue = translateValue(op, selectedOp, value);
                if (selectedOp === '$eq') mutate.updateValue(newValue);
                else mutate.apply(m => m.in(op).updateKey(selectedOp).updateValue(newValue));
              }}
              onValueUpdate={mutate.in(op).updateValue} {...{ value, op, typeDetails }}
            />
            : <PropertyPredicate predicate={value} mutate={mutate.in(op)} property={property} />)
      )
    }</div>
  );
};

let PropertyPredicate = ({predicate, mutate, property}) => {
  let typeDetails = ContextService.getPropertyTypeDetails(property);

  return (typeof (predicate) !== 'object') ?
    <ShortPredicate value={predicate} {...{ typeDetails, mutate } } /> :
    <ComplexPredicate {...{ predicate, mutate, property, typeDetails }} />;
};
export default PropertyPredicate;
