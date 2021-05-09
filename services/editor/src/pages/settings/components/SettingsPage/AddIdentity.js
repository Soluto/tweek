import React, { useState } from 'react';
import { useHistory } from 'react-router';
import { Input } from '../../../../components/common';

const initialState = { isEditing: false, value: '' };

const AddIdentity = () => {
  const history = useHistory();
  const [{ isEditing, value }, setState] = useState(initialState);
  const toggleEdit = () => setState((s) => ({ ...s, isEditing: true }));
  const change = (value) => setState((s) => ({ ...s, value: value.toLowerCase() }));
  const reset = () => setState(initialState);

  return (
    <div data-comp="add-new-identity">
      {isEditing ? (
        <Input
          value={value}
          onChange={change}
          placeholder="Identity name"
          onKeyUp={(e) => e.which === 27 && reset()}
          onEnterKeyPress={() => {
            reset();
            history.push(`/settings/identities/${value}`);
          }}
        />
      ) : (
        <button onClick={toggleEdit}>Add New Identity</button>
      )}
    </div>
  );
};

export default AddIdentity;
