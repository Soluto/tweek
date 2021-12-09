import { useEffect, useState } from 'react';

export const useDebounceValue = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedValue(value), delay);

    return () => clearTimeout(timeout);
  }, [value]); //eslint-disable-line react-hooks/exhaustive-deps

  return debouncedValue;
};
