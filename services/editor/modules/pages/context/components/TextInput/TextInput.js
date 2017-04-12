import React, { PropTypes } from 'react';

import style from './text-input.css';

const isEnterKeyPressed = event => event.keyCode == 13 || event.which == 13;

const TextInput = ({ placeholder, onChange, onEnterKeyPress }) => {
  return <input
    className={ style['context-text-input'] }
    type={ 'text' }
    onKeyPress={ e => isEnterKeyPressed(e) && onEnterKeyPress() }
    placeholder={ placeholder }
    onChange={ onChange } />
}

TextInput.defaultProps = {
  onChange: () => { },
  onEnterKeyPress: () => { },
  placeholder: ''
}

TextInput.propTypes = {
  onChange: PropTypes.func.isRequired,
  onEnterKeyPress: PropTypes.func.isRequired,
  placeholder: PropTypes.string.isRequired
}

export default TextInput;