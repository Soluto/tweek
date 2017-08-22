import React from 'react';
import PropTypes from 'prop-types';
import ReactTooltip from 'react-tooltip';
import alertIconSrc from '../../resources/alert-icon.svg';

const ValidationIcon = ({ show, hint }) =>
  <div
    className="validation-icon-wrapper"
    data-comp="validation-icon"
    data-is-shown={show}
    style={{ opacity: show ? 1 : 0 }}
  >
    <img className="validation-icon" data-tip={hint} src={alertIconSrc} />
    <ReactTooltip disable={!show || !hint} effect="solid" place="top" delayHide={500} />
  </div>;

ValidationIcon.propTypes = {
  show: PropTypes.bool.isRequired,
  hint: PropTypes.string,
};

export default ValidationIcon;
