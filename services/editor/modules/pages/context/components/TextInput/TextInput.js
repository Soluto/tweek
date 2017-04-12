import React, { PropTypes } from 'react';

import style from './text-input.css';

const isEnterKeyPressed = event => event.keyCode == 13 || event.which == 13;

const TextInput = ({ placeholder, value, onChange, onEnterKeyPress }) => {

  let props = {
    className: style['context-text-input'],
    type: 'text',
    onKeyPress: e => isEnterKeyPressed(e) && onEnterKeyPress(),
    placeholder,
    onChange
  }

  if (value !== undefined){
    props.value = value;
  }
  
  return <input { ...props }/>
}

TextInput.defaultProps = {
  onChange: () => { },
  onEnterKeyPress: () => { },
  placeholder: ''
}

TextInput.propTypes = {
  onChange: PropTypes.func.isRequired,
  onEnterKeyPress: PropTypes.func.isRequired,
  placeholder: PropTypes.string.isRequired,
  value: PropTypes.string
}

export default TextInput;