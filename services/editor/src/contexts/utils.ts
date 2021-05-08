import { equals } from 'ramda';
import { Context, DependencyList, useContext, useEffect, useState } from 'react';
import { BehaviorSubject } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';

export const createUseContext = <State>(context: Context<BehaviorSubject<State>>) => <
  Params extends any[],
  T
>(
  mapper: (state: State, ...args: Params) => T,
) => (...args: Params) => {
  const state$ = useContext(context);
  return useObservableState(state$, (s) => mapper(s, ...args), args);
};

export const useObservableState = <State, T>(
  state$: BehaviorSubject<State>,
  mapper: (state: State) => T,
  deps: DependencyList,
) => {
  const [state, setState] = useState(mapper(state$.value));

  useEffect(() => {
    const subscription = state$
      .pipe(
        map((s) => mapper(s)),
        distinctUntilChanged<T>(equals),
      )
      .subscribe(setState);

    return () => subscription.unsubscribe();
  }, [state$, ...deps]); //eslint-disable-line react-hooks/exhaustive-deps

  return state;
};
