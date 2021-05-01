import { useEffect, useState } from 'react';
import { useTweekValue } from 'react-tweek';
import ComboBox, { ComboBoxProps } from './ComboBox';

export type SearchConfig = {
  maxSearchResults?: number;
  showInternalKeys?: boolean;
};

export type AutoSuggestProps<T> = Omit<ComboBoxProps<T>, 'suggestions'> & {
  getSuggestions: (query: string, config: SearchConfig) => T[] | Promise<T[]>;
};

const AutoSuggest = <T,>({ getSuggestions, onChange, ...props }: AutoSuggestProps<T>) => {
  const [suggestions, setSuggestions] = useState<T[]>([]);
  const [search, setSearch] = useState(props.value);
  const maxSearchResults = useTweekValue<number | undefined>(
    '@tweek/editor/search/max_results',
    undefined,
  );
  const showInternalKeys = useTweekValue<boolean | undefined>(
    '@tweek/editor/show_internal_keys',
    undefined,
  );

  useEffect(() => {
    setSearch(props.value);
  }, [props.value]);

  useEffect(() => {
    if (!search) {
      setSuggestions([]);
      return;
    }

    let cancel = false;

    const timeout = setTimeout(async () => {
      const suggestions = await getSuggestions(search, { maxSearchResults, showInternalKeys });
      !cancel && setSuggestions(suggestions);
    }, 500);

    return () => {
      cancel = true;
      clearTimeout(timeout);
    };
  }, [search]); //eslint-disable-line react-hooks/exhaustive-deps

  return (
    <ComboBox
      suggestions={suggestions}
      onChange={(input, selected) => {
        setSearch(input);
        onChange && onChange(input, selected);
      }}
      {...props}
    />
  );
};

export default AutoSuggest;
