/* global document */
import React, { Component } from 'react';
import PropTypes from 'prop-types';

const events = ['mousedown', 'touchstart'];

function clickedScrollbar(evt) {
  return (
    document.documentElement.clientWidth <= evt.clientX ||
    document.documentElement.clientHeight <= evt.clientY
  );
}

export default class ClickOutside extends Component {
  static propTypes = {
    onClickOutside: PropTypes.func.isRequired,
  };

  handle = (e) => {
    if (clickedScrollbar(e)) return;
    const { onClickOutside } = this.props;
    const el = this.container;
    if (!el.contains(e.target)) onClickOutside(e);
  };

  render() {
    const { children, onClickOutside, ...props } = this.props;
    return (
      <div {...props} ref={(ref) => (this.container = ref)}>
        {children}
      </div>
    );
  }

  componentDidMount() {
    events.forEach((eventName) => document.addEventListener(eventName, this.handle, true));
  }

  componentWillUnmount() {
    events.forEach((eventName) => document.removeEventListener(eventName, this.handle, true));
  }
}
