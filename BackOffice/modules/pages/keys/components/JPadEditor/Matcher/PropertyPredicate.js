
import React from 'react';

import R from 'ramda';
import EditorMetaService from '../../../../../services/EditorMetaService';
import { MatcherOp, getSupportedOps } from './ops';
import PropertyValue from './PropertyValue';

let editorMetaService = new EditorMetaService();
editorMetaService.init();

let EmptyPredicate = () => null;

let BinaryPredicate = ({ onValueUpdate, onOpUpdate, op, meta, value }) => (<div style={{ display: 'flex' }}>
  <MatcherOp onUpdate={onOpUpdate} supportedOps={getSupportedOps(meta)} selectedOp={op} />
    <PropertyValue {...{ meta, value, onUpdate: onValueUpdate }} />
  </div>);

let ShortPredicate = ({ meta, mutate, value }) => {
  if (meta.type === 'empty') return <EmptyPredicate/>;
  return (<BinaryPredicate
    onValueUpdate={mutate.updateValue}
    onOpUpdate={selectedOp => {
    if (selectedOp === '$eq') return;
    mutate.updateValue({
      [selectedOp]: mutate.getValue(),
      ...(meta.compare ? { $compare: meta.compare } : {}),
    });
  }} op="$eq" {...{ value, meta }}
  />);
};

let ComplexPredicate = ({ predicate, mutate, property, meta }) => {
  return (<div style={{ display: 'flex' }}>{
                R.flatten(R.toPairs(predicate)
                .filter(([key]) => key[0] === '$')
                .filter(([op]) => op !== '$compare')
                .map(([op, value]) =>
                     (typeof(value) !== 'object') ?
                     <BinaryPredicate key={op}
                       onOpUpdate={selectedOp => {
                       if (selectedOp === '$eq') mutate.updateValue(mutate.in(op).getValue());
                       else mutate.in(op).updateKey(selectedOp);
                     }}
                       onValueUpdate={mutate.in(op).updateValue} {...{ value, op, meta }}
                     />
                     : <PropertyPredicate predicate={value} mutate={mutate.in(op)} property={property} />)
    )
  }</div>);
};

let PropertyPredicate = ({ predicate, mutate, property }) => {
  let meta = editorMetaService.getFieldMeta(property);
  if (typeof(predicate) !== 'object') return <ShortPredicate value={predicate} {...{ meta, mutate } } />;

  return <ComplexPredicate {...{ predicate, mutate, property, meta }} />;
};
export default PropertyPredicate; // PropertyPredicate
