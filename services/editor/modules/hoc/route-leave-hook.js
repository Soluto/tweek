import React from 'react';
import ReactDOM from 'react-dom';
import { compose, lifecycle } from 'recompose';
import { withRouter } from 'react-router';

const routeLeaveHook = fnConfirm => Comp => compose(
    withRouter,
    lifecycle({
      componentDidMount() {
        window.onbeforeunload = () => fnConfirm(this.props);
        this.props.router.setRouteLeaveHook(this.props.route, () => fnConfirm(this.props));
      },
    }),
  )(props => <Comp {...props} />);

export default routeLeaveHook;
