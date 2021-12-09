import React, { ComponentType, FunctionComponent, useEffect, useState } from 'react';
import ErrorPage from '../components/ErrorPage';
import Loader from '../components/Loader';

type State = {
  loading: boolean;
  error?: unknown;
};

const withLoading = (loadingPromiseFactory: () => Promise<any>) => <T,>(
  Comp: ComponentType<T>,
): FunctionComponent<T> => (props) => {
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
