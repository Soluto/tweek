import React from 'react';
import { connect } from 'react-redux';
import { compose, withStateHandlers } from 'recompose';
import { addNewIdentity } from '../../../../store/ducks/schema';
import Input from '../../../../components/common/Input/Input';

const enhance = compose(
  connect(
    null,
    { addNewIdentity },
  ),
  withStateHandlers(
    { isEditing: false, value: '' },
    {
      toggleEdit: () => () => ({ isEditing: true }),
      change: () => (value) => ({ value: value.toLowerCase() }),
      reset: () => () => ({ isEditing: false, value: '' }),
    },
  ),
);

const AddIdentity = ({ isEditing, value, toggleEdit, change, reset, addNewIdentity }) => (
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

export default enhance(AddIdentity);
