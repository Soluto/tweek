import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import './Input.css';

const isEnterKeyPressed = event => event.keyCode === 13 || event.which === 13;

const Input = ({ onEnterKeyPress, onKeyPress, onChange, autofocus, className, onFocus, onBlur, ...props }) =>
  <input
    onFocus={onFocus}
    onBlur={onBlur}
    className={classnames('text-input', className)}
    onKeyPress={(e) => {
      if (onEnterKeyPress && isEnterKeyPressed(e)) {
        onEnterKeyPress();
        e.preventDefault();
      } else if (onKeyPress) {
        onKeyPress(e);
      }
    }}
    onChange={e => onChange && onChange(e.target.value)}
    ref={e => e && autofocus && e.focus()}
    {...props}
  />;

Input.propTypes = {
  onEnterKeyPress: PropTypes.func,
  onChange: PropTypes.func,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
  placeholder: PropTypes.string,
  className: PropTypes.string,
  type: PropTypes.string,
  autofocus: PropTypes.bool,
  value: PropTypes.any,
};

Input.defaultProps = {
  onEnterKeyPress: undefined,
  onChange: undefined,
  onFocus: ()=>{},
  onBlur: ()=>{},
  placeholder: '',
  className: undefined,
  type: 'text',
  autofocus: false,
  value: '',
};

export default Input;
