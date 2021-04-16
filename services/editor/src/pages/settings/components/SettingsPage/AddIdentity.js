import styled from '@emotion/styled';
import React, { useState } from 'react';
import { connect } from 'react-redux';
import Input from '../../../../components/common/Input/Input';
import { addNewIdentity } from '../../../../store/ducks/schema';

const Button = styled.button`
  font-size: 14px;
  padding-left: 15px;
  padding-right: 15px;
`;

const IdentityInput = styled(Input)`
  color: #d8d8d8;
  font-size: 16px;
`;

const enhance = connect(null, { addNewIdentity });

const cleanState = { isEditing: false, value: '' };

const AddIdentity = ({ addNewIdentity }) => {
  const [{ isEditing, value }, setState] = useState(cleanState);
  const toggleEdit = () => setState((s) => ({ ...s, isEditing: true }));
  const change = (value) => setState((s) => ({ ...s, value: value.toLowerCase() }));
  const reset = () => setState(cleanState);

  return (
    <div data-comp="add-new-identity">
      {isEditing ? (
        <IdentityInput
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
        <Button className="metro-button" onClick={toggleEdit}>
          Add New Identity
        </Button>
      )}
    </div>
  );
};

export default enhance(AddIdentity);
