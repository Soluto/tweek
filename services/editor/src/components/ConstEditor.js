import React from 'react';
import TypedInput from './common/Input/TypedInput';
import { JsonEditor } from './JsonEditor';

const ConstEditor = ({ value, valueType, onChange, onValidationChange }) =>
  valueType === 'object'
    ? <JsonEditor {...{ value, onChange, onValidationChange }} />
    : <div data-comp="const-editor">
        <TypedInput {...{ value, valueType, onChange }} />
      </div>;

export default ConstEditor;
