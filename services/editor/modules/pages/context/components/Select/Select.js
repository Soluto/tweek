import React, { PropTypes } from 'react';

import style from './select.css';

const Select = ({ options, value, onChange }) => {
  return <select className={ style['context-select'] } value={ value } onChange={ onChange }>{
    options.map(option => <option key={ option } value={ option }>{ option }</option>)
  }</select>
}

Select.defaultProps = {
  onChange: () => { },
  options: [],
  value: ''
}

Select.propTypes = {
  onChange: PropTypes.func.isRequired,
  options: PropTypes.array.isRequired,
  value: PropTypes.string.isRequired
}

export default Select;