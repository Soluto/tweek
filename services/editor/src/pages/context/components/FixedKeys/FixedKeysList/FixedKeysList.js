import React from 'react';
import PropTypes from 'prop-types';
import FixedKey from './FixedKey/FixedKey';
import './FixedKeysList.css';

const FixedKeysList = ({ keys, onChange, toggleDelete }) =>
  <div className={'fixed-keys-container'}>
    {keys.map((key, index) =>
      <FixedKey
        key={'remote' in key ? key.keyPath : index}
        {...key}
        toggleDelete={() => toggleDelete(index)}
        onChange={(...args) => onChange(index, ...args)}
      />,
    )}
  </div>;

FixedKeysList.propTypes = {
  keys: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired,
  toggleDelete: PropTypes.func.isRequired,
};

export default FixedKeysList;
