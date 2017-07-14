import React from 'react';
import PropTypes from 'prop-types';
import './Label.css';

const Label = ({ text }) => <label data-comp="label">{text}</label>;

Label.propTypes = {
  text: PropTypes.string,
};

export default Label;
