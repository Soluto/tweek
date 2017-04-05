import React from 'react';
import ReactDOM from 'react-dom';
import { compose, lifecycle, pure, withState } from 'recompose';

const withLoading = (loadingRenderer, loadingPromise) => (Comp) => {
  return compose(
    withState('isLoading', 'setIsLoading', true),
    pure,
    lifecycle({
      componentWillMount() {
        var _this = this;
        if (typeof(loadingPromise) === "function") {
           loadingPromise = loadingPromise(this.props);
        }
        loadingPromise.then(() => _this.props.setIsLoading(false));
      },
    }))(props => {
      return (
        props.isLoading ? loadingRenderer(props) : <Comp {...props} />
      );
    })
};

export default withLoading;
