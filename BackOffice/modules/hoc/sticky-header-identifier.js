import React from 'react';
import ReactDOM from 'react-dom';
import { compose, pure, lifecycle, withState } from 'recompose';

const stickyHeaderIdentifier = (elementId, triggerScrollFromTop) => (Comp) => {
  return compose(
    pure,
    withState('isInStickyMode', 'setIsInStickyMode', false),
    lifecycle({
      cleanup: () => { },
      componentDidMount() {
        const element = document.getElementById(elementId);
        const handler = (eventArgs) => {
          const distanceFromTop = eventArgs.target.scrollTop;

          const shouldShowSticky = distanceFromTop > triggerScrollFromTop;
          if (shouldShowSticky === this.props.isInStickyMode) return;

          this.props.setIsInStickyMode(shouldShowSticky);
        };

        element.addEventListener('scroll', handler);
        this.cleanup = () => element.removeEventListener('scroll', handler);
      },
      componentWillUnmount() {
        this.cleanup();
      },
    }))(
    props => <Comp {...props} />
    );
};

export default stickyHeaderIdentifier;