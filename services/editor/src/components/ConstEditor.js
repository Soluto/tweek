import React from 'react';
import TypedInput from './common/Input/TypedInput';
import { JsonEditor } from './JsonEditor';

const ConstEditor = ({ value, valueType, onChange, onValidationChange }) =>
  valueType === 'object'
    ? <JsonEditor {...{ value, onChange, onValidationChange }} />
    : <TypedInput data-comp="const-editor" {...{ value, valueType, onChange }} />;

export default ConstEditor;
