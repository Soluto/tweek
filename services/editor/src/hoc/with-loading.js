import React, { useEffect, useState } from 'react';

const withLoading = (loadingRenderer, loadingErrorRenderer, loadingPromiseFactory) => (Comp) => (
  props,
) => {
  const [{ loading, error }, setState] = useState({ loading: true });

  useEffect(() => {
    loadingPromiseFactory(props)
      .then(() => setState({ loading: false }))
      .catch((err) => setState({ loading: false, error: err }));
  }, []);

  if (loading) {
    return loadingRenderer();
  }

  if (error) {
    return loadingErrorRenderer(error);
  }

  return <Comp {...props} />;
};

export default withLoading;
