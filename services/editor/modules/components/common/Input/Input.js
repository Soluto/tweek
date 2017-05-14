import React, { PropTypes } from 'react';
import style from './Input.css';

const isEnterKeyPressed = event => event.keyCode === 13 || event.which === 13;

const Input = ({ onEnterKeyPress, ...props }) => (
  <input
    onKeyPress={(e) => {
      if (onEnterKeyPress && isEnterKeyPressed(e)) {
        onEnterKeyPress();
        e.preventDefault();
      }
    }}
    {...props}
  />
  );

Input.propTypes = {
  onEnterKeyPress: PropTypes.func,
  placeholder: PropTypes.string,
  className: PropTypes.string,
  type: PropTypes.string,
};

Input.defaultProps = {
  onEnterKeyPress: undefined,
  placeholder: '',
  className: style['text-input'],
  type: 'text',
};

export default Input;
