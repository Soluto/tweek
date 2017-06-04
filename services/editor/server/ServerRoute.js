import React, { Component, PropTypes } from 'react';

class ServerRoute extends Component {
  render() {
    return null;
  }
}

const handler = PropTypes.oneOfType([PropTypes.func, PropTypes.object]);

ServerRoute.propTypes = {
  path: PropTypes.string.isRequired,
  get: handler,
  post: handler,
  patch: handler,
  put: handler,
  delete: handler,
};

ServerRoute.defaultProps = {
  isServerRoute: true,
};

export default ServerRoute;
