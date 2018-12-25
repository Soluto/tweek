import React from 'react';
import { compose, lifecycle, withState } from 'recompose';

const withLoading = (loadingRenderer, loadingErrorRenderer, loadingPromiseFactory) => Comp =>
  compose(
    withState('isLoading', 'setIsLoading', true),
    withState('loadingError', 'setLoadingError', null),
    lifecycle({
      async componentWillMount() {
        try {
          await loadingPromiseFactory(this.props);
          this.props.setIsLoading(false);
        }
        catch(e) {
          this.props.setLoadingError(e);
          this.props.setIsLoading(false);
        }
      },
    }),
  )((props) => {
    if (props.isLoading) {
      return loadingRenderer();
    }
    if (props.loadingError) {
      return loadingErrorRenderer(props.loadingError);
    }
    return <Comp {...props} />;
  });

export default withLoading;
