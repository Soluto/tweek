import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactTooltip from 'react-tooltip';
import Chance from 'chance';
import alertIconSrc from '../../resources/alert-icon.svg';

const chance = new Chance();

export default class ValidationIcon extends Component {
  static propTypes = {
    show: PropTypes.bool.isRequired,
    hint: PropTypes.string,
  };

  componentWillMount() {
    this.tooltipId = chance.guid();
  }

  render() {
    const { show, hint } = this.props;
    return (
      <div
        className="validation-icon-wrapper"
        data-comp="validation-icon"
        data-is-shown={show}
        style={{ opacity: show ? 1 : 0 }}
      >
        <img
          className="validation-icon"
          src={alertIconSrc}
          data-tip={hint}
          data-for={this.tooltipId}
        />
        <ReactTooltip
          id={this.tooltipId}
          disable={!show || !hint}
          effect="solid"
          place="top"
          delayHide={500}
        />
      </div>
    );
  }
}
