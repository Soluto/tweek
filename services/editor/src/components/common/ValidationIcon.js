import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactTooltip from 'react-tooltip';
import Chance from 'chance';

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
        <i
          className="validation-icon"
          data-tip={hint}
          data-for={this.tooltipId}
          data-tip-disable={!show || !hint}
          data-delay-hide={500}
          data-effect="solid"
          data-place="top"
        />
        <ReactTooltip id={this.tooltipId} />
      </div>
    );
  }
}
