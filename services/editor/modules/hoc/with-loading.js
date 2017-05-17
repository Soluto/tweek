import React from 'react';
import { compose, lifecycle, pure, withState } from 'recompose';

const withLoading = (loadingRenderer, loadingPromise) => Comp => compose(
    withState('isLoading', 'setIsLoading', true),
    pure,
    lifecycle({
      componentWillMount() {
        loadingPromise.then(() => this.props.setIsLoading(false));
      },
    }))(props => (
        props.isLoading ? loadingRenderer() : <Comp {...props} />
      ));

export default withLoading;
