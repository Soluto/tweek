import React, { PropTypes } from 'react';
import FixedKey from './FixedKey/FixedKey';
import style from './FixedKeysList.css';

const FixedKeysList = ({ keys, onChange }) => (
  <div className={style['fixed-keys-container']}>
    {keys.map((key, index) => (
      <FixedKey
        key={key.remote ? key.remote.key : index}
        {...key}
        onChange={(...args) => onChange(index, ...args)}
      />
    ))}
  </div>
);

FixedKeysList.propTypes = {
  keys: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default FixedKeysList;
