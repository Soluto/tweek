import React from 'react';
import R from 'ramda';
import { Operator, getSupportedOperators } from './Operator';
import PropertyValue from './PropertyValue';
import * as ContextService from "../../../../../../../../../services/context-service";

const isValueType = (value) => R.isArrayLike(value) || typeof (value) !== 'object';

let BinaryPredicate = ({onValueUpdate, onOpUpdate, op, meta, value}) => {
  return (
    <div style={{ display: 'flex' }}>
      <Operator onUpdate={onOpUpdate} supportedOperators={getSupportedOperators(meta)} selectedOp={op} />
      <PropertyValue {...{ meta, value, onUpdate: onValueUpdate, op }} />
    </div>
  );
};

let translateValue = (oldOp, newOp, value) => {
  if (oldOp === '$in') return value.length === 1 ? value[0] : '';
  if (newOp === '$in') return value === '' ? [] : [value];
  return value;
};

let ShortPredicate = ({meta, mutate, value}) => {
  console.log(meta);
  return (
    <BinaryPredicate
      onValueUpdate={mutate.updateValue}
      onOpUpdate={selectedOp => {
        if (selectedOp === '$eq') return;
        mutate.updateValue({
          [selectedOp]: translateValue('$eq', selectedOp, value),
          ...(meta.comparer ? { $compare: meta.comparer } : {}),
        });
      }}
      op="$eq"
      {...{ value, meta } }
    />
  );
};

let ComplexPredicate = ({predicate, mutate, property, meta}) => {
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
              onValueUpdate={mutate.in(op).updateValue} {...{ value, op, meta }}
            />
            : <PropertyPredicate predicate={value} mutate={mutate.in(op)} property={property} />)
      )
    }</div>
  );
};

let PropertyPredicate = ({predicate, mutate, property}) => {
  let meta = ContextService.getMetaForProperty(property);

  return (typeof (predicate) !== 'object') ?
    <ShortPredicate value={predicate} {...{ meta, mutate } } /> :
    <ComplexPredicate {...{ predicate, mutate, property, meta }} />;
};
export default PropertyPredicate;
