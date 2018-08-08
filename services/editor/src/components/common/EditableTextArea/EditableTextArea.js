import './EditableTextArea.css';
import React from 'react';
import SimpleMDE from 'react-simplemde-editor';
import 'simplemde/dist/simplemde.min.css';

export default ({ value, onChange = () => {} }) => (
  <div className={'textarea-container'}>
    <SimpleMDE
      options={{
        spellChecker: false,
        status: false,
        toolbar: false,
      }}
      value={value}
      onChange={onChange}
    />
  </div>
);
