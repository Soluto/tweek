import * as changeCase from 'change-case';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import { ComboBox, Input } from '../../../../../components/common';
import { getIdentities } from '../../../../../services/context-service';
import './SearchBox.css';

const SearchBox = ({ identityId: initialIdentityId, identityType: initialIdentityType }) => {
  const [identityId, setIdentityId] = useState(initialIdentityId);
  const [identityType, setIdentityType] = useState(initialIdentityType);

  useEffect(() => {
    setIdentityId(initialIdentityId);
  }, [initialIdentityId]);

  useEffect(() => {
    setIdentityType(initialIdentityType);
  }, [initialIdentityType]);

  const identities = getIdentities().map((x) => ({ label: changeCase.pascalCase(x), value: x }));

  const history = useHistory();
  const onGetClick = () => history.push(`/context/${identityType}/${identityId}`);

  return (
    <div className="context-search-container" data-comp="search-identity">
      <div className="identity-type-container">
        <ComboBox
          data-field="identity-type"
          className="identity-type"
          placeholder="Enter Identity Type"
          value={identityType}
          suggestions={identities}
          onChange={(inputValue, selected) =>
            setIdentityType(selected ? selected.value : inputValue)
          }
        />
      </div>

      <div className="identity-id-container">
        <Input
          data-field="identity-id"
          placeholder={`Enter ${changeCase.pascalCase(identityType || 'identity')} Id`}
          onEnterKeyPress={onGetClick}
          onChange={setIdentityId}
          value={identityId}
        />
      </div>

      <div className="search-button-container">
        <button
          data-comp="search"
          className="search-button"
          onClick={onGetClick}
          disabled={!identityType || !identityId}
        />
      </div>
    </div>
  );
};

export default SearchBox;
