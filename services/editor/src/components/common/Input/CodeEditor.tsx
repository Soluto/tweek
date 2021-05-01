import React, { useState } from 'react';
import { ValueType } from '../../../contexts/TypesService';
import CodeModal from './CodeModal';
import Input, { InputProps } from './Input';

const getEmptyValue = (valueType: ValueType) => {
  let baseType = valueType.base || valueType.name;
  if (baseType === 'array') {
    return `[\n\t\n]`;
  }
  if (baseType === 'object') {
    return `{\n\t\n}`;
  }
  return '';
};

export type CodeEditorProps = InputProps & {
  value: any;
  valueType: ValueType;
  onChange: (value: any) => void;
  'data-comp'?: string;
};

const CodeEditor = ({
  onChange,
  value,
  valueType,
  'data-comp': dataComp,
  ...props
}: CodeEditorProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div data-comp={dataComp}>
      <Input
        onDoubleClick={() => setIsOpen(true)}
        readOnly
        {...props}
        onChange={onChange}
        value={value && JSON.stringify(value)}
      />
      <button
        className="text-input object-type-expander"
        data-comp="object-editor"
        onClick={() => setIsOpen(true)}
      />
      <CodeModal
        visible={isOpen}
        value={value ? JSON.stringify(value, null, 4) : getEmptyValue(valueType)}
        valueType={valueType}
        onClose={(value) => {
          setIsOpen(false);
          value && onChange(value);
        }}
      />
    </div>
  );
};

export default CodeEditor;
