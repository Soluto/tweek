import React, { Component, ErrorInfo } from 'react';
import PropTypes from 'prop-types';

export type ErrorHandlerProps = {
  onError?: (error: Error, info: ErrorInfo) => void;
  errorMessage?: string;
};

type State = {
  hasError: boolean;
};

export default class ErrorHandler extends Component<ErrorHandlerProps, State> {
  static propTypes = {
    onError: PropTypes.func,
    errorMessage: PropTypes.string,
  };

  state = {
    hasError: false,
  };

  componentDidCatch(error: Error, info: ErrorInfo) {
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
