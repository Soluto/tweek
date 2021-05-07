import { equals } from 'ramda';
import { useEffect, useState } from 'react';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { SelectedKey, useSelectedKeyContext } from './SelectedKey';

export const createUseSelectedKey = <T>(mapValue: (key: SelectedKey) => T) => (): T => {
  const key$ = useSelectedKeyContext();
  const [state, setState] = useState(mapValue(key$.value));

  useEffect(() => {
    const subscription = key$
      .pipe(map(mapValue), distinctUntilChanged<T>(equals))
      .subscribe(setState);

    return () => subscription.unsubscribe();
  }, [key$]);

  return state;
};
