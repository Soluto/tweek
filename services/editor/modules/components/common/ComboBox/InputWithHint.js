import React, { PropTypes } from 'react';

const style = {
  container: {
    outline: 'none',
    position: 'relative',
  },
  input: ({ disabled }) => ({
    backgroundColor: !disabled && 'transparent',
    display: 'block',
    position: 'relative',
    zIndex: 1,
  }),
  hint: {
    borderColor: 'transparent',
    bottom: 0,
    boxShadow: 'none',
    color: '#a5a5a5',
    display: 'block',
    position: 'absolute',
    top: 0,
    width: '100%',
    zIndex: 0,
  },
};

const InputWithHint = ({ value, showHint, hint, autofocus, placeholder, ...props }) => (
  <div className="bootstrap-typeahead-input" style={style.container} tabIndex={-1}>
    <input
      className="bootstrap-typeahead-input-main"
      {...props}
      value={value}
      autoComplete="off"
      style={style.input(props)}
      ref={e => e && autofocus && e.focus()}
    />
    <input
      className="bootstrap-typeahead-input-hint"
      value={showHint ? hint : value.length > 0 ? '' : placeholder}
      readOnly
      autoComplete="off"
      style={style.hint}
      tabIndex={-1}
    />
  </div>
);

InputWithHint.propTypes = {
  showHint: PropTypes.bool.isRequired,
  hint: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  autofocus: PropTypes.bool,
};

InputWithHint.defaultProps = {
  placeholder: '',
  autofocus: false,
};

export default InputWithHint;
