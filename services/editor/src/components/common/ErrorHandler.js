import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class ErrorHandler extends Component {
  static propTypes = {
    onError: PropTypes.func,
    errorMessage: PropTypes.string,
  };

  state = {
    hasError: false,
  };

  componentDidCatch(error, info) {
    this.setState({ hasError: true });

    const { onError } = this.props;
    onError && onError(error, info);
  }

  render() {
    if (this.state.hasError) {
      const { errorMessage } = this.props;
      return errorMessage ? <div>{errorMessage}</div> : null;
    }

    return this.props.children;
  }
}
