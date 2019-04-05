import React from 'react';
import { Prompt } from 'react-router';
import { lifecycle, compose } from 'recompose';

const routeLeaveHook = (fn, message, wrapperProps) =>
  compose(
    lifecycle({
      componentWillMount() {
        this._onUnload = (e) => {
          e = e || window.event;
          if (fn(this.props)) {
            e.returnValue = message;
            return message;
          }
        };
        window.addEventListener('beforeunload', this._onUnload);
      },
      componentWillUnmount() {
        window.removeEventListener('beforeunload', this._onUnload);
      },
    }),
    (Component) => (props) => (
      <div {...wrapperProps}>
        <Prompt message={message} when={fn(props)} />
        <Component {...props} />
      </div>
    ),
  );

export default routeLeaveHook;
