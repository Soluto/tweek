import React from 'react';
import PropTypes from 'prop-types';
import FixedKey from './FixedKey/FixedKey';
import './FixedKeysList.css';

const FixedKeysList = ({ keys, onChange }) =>
  <div className={'fixed-keys-container'}>
    {keys.map((key, index) =>
      <FixedKey
        key={key.remote ? key.remote.key : index}
        {...key}
        onChange={(...args) => onChange(index, ...args)}
      />,
    )}
  </div>;

FixedKeysList.propTypes = {
  keys: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default FixedKeysList;
