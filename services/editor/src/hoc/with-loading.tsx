import React, { ComponentType, useEffect, useState } from 'react';
import ErrorPage from '../components/ErrorPage';
import Loader from '../components/Loader';

type State = {
  loading: boolean;
  error?: unknown;
};

const withLoading = (loadingPromiseFactory: () => Promise<void>) => <T,>(
  Comp: ComponentType<T>,
) => (props: T) => {
  const [{ loading, error }, setState] = useState<State>({ loading: true });

  useEffect(() => {
    loadingPromiseFactory()
      .then(() => setState({ loading: false }))
      .catch((error) => setState({ loading: false, error }));
  }, []);

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return <ErrorPage error={error} />;
  }

  return <Comp {...props} />;
};

export default withLoading;
