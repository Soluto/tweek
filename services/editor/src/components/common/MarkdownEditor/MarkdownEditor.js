import './MarkdownEditor.css';
import React from 'react';
import SimpleMDE from 'react-simplemde-editor';
import 'easymde/dist/easymde.min.css';

export default ({ value, onChange = () => {} }) => (
  <div className={'textarea-container'}>
    <SimpleMDE
      options={{
        minHeight: '100px',
        placeholder: 'Write Key Description',
        spellChecker: false,
        status: false,
        toolbar: false,
      }}
      value={value}
      onChange={onChange}
    />
  </div>
);
