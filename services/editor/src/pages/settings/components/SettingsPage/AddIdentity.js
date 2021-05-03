import React, { useState } from 'react';
import { connect } from 'react-redux';
import { Input } from '../../../../components/common';
import { addNewIdentity } from '../../../../store/ducks/schema';

const enhance = connect(null, { addNewIdentity });

const initialState = { isEditing: false, value: '' };

const AddIdentity = ({ addNewIdentity }) => {
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
            addNewIdentity(value);
          }}
        />
      ) : (
        <button onClick={toggleEdit}>Add New Identity</button>
      )}
    </div>
  );
};

export default enhance(AddIdentity);
