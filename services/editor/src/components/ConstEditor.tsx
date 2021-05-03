import React from 'react';
import { ValueType } from '../contexts/TypesService';
import { TypedInput } from './common';

export type ConstEditorProps = {
  value: any;
  valueType: string | ValueType;
  onChange: (value: any) => void;
};

const ConstEditor = ({ value, valueType, onChange }: ConstEditorProps) => (
  <div data-comp="const-editor" style={{ display: 'flex', width: '100%' }}>
    <TypedInput value={value} valueType={valueType} onChange={onChange} />
  </div>
);

export default ConstEditor;
