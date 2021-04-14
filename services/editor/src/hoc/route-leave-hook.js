import React from 'react';
import { Prompt, useLocation } from 'react-router';
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
    (Component) => (props) => {
      const location = useLocation();
      return (
        <div {...wrapperProps}>
          <Prompt
            message={(nextLocation) => {
              if (fn(props, nextLocation, location)) {
                return message;
              }
              return true;
            }}
          />
          <Component {...props} />
        </div>
      );
    },
  );

export default routeLeaveHook;
