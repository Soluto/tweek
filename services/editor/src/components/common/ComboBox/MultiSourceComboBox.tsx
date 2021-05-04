import classnames from 'classnames';
import PropTypes from 'prop-types';
import React, {
  createContext,
  FunctionComponent,
  ReactNodeArray,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useDebounceValue, useMaxSearchResults, useShowInternalKeys } from '../../../utils';
import { SearchConfig } from './AutoSuggest';
import ComboBox, { ComboBoxProps } from './ComboBox';
import './MultiSourceComboBox.css';

type Context = {
  sources: string[];
  selected: string | undefined;
  setSourceId: (source: string | undefined) => void;
};

const MultiSourceComboBoxContext = createContext<Context>({
  sources: [],
  selected: '',
  setSourceId: () => {},
});

type SourceTitleProps = {
  id?: string;
};

const SourceTitle = ({ id }: SourceTitleProps) => {
  const { setSourceId, selected } = useContext(MultiSourceComboBoxContext);

  return (
    <div
      onClick={() => setSourceId(id)}
      className={classnames('source-item', { active: id === selected })}
    >
      {id === undefined ? 'All' : id}
    </div>
  );
};

const MultiSourceSuggestionContainer: FunctionComponent = ({ children }) => {
  const { sources } = useContext(MultiSourceComboBoxContext);

  return (
    <div className={'multi-source-combo-box-suggestions'}>
      <div className={'source-select'}>
        <SourceTitle />
        {sources.map((key) => (
          <SourceTitle id={key} key={key} />
        ))}
      </div>
      <ul
        className="bootstrap-typeahead-menu dropdown-menu dropdown-menu-justify"
        style={{
          display: 'block',
          overflow: 'auto',
          maxHeight: '300px',
          position: 'relative',
        }}
      >
        {(children as ReactNodeArray)?.length > 0 ? children : 'Not found...'}
      </ul>
    </div>
  );
};

type GetSuggestions<T> = (query: string, config: SearchConfig) => T[] | Promise<T[]>;

function getAllSuggestions<T>(
  getSuggestions: Record<string, GetSuggestions<T>>,
): GetSuggestions<T> {
  return async function (query, config) {
    const suggestionPromises = Object.values(getSuggestions).map((fn) => fn(query, config));
    const suggestions = await Promise.all(suggestionPromises);
    return suggestions.flat(1);
  };
}

type BaseProps<T> = {
  getSuggestions: Record<string, GetSuggestions<T>>;
};

export type MultiSourceComboBoxProps<T> = BaseProps<T> &
  Omit<ComboBoxProps<T>, keyof BaseProps<T> | ''>;

const MultiSourceComboBox = <T,>({
  value = '',
  getSuggestions,
  onChange,
  ...props
}: MultiSourceComboBoxProps<T>) => {
  const [search, setSearch] = useState(value);
  const [sourceId, setSourceId] = useState<string>();
  const [suggestions, setSuggestions] = useState<T[]>([]);

  const maxSearchResults = useMaxSearchResults();
  const showInternalKeys = useShowInternalKeys();

  useEffect(() => {
    setSearch(value);
  }, [value]);

  const debouncedSearch = useDebounceValue(search, search ? 500 : 0);

  useEffect(() => {
    let cancel = false;

    const getSuggestionsFn =
      (sourceId && getSuggestions[sourceId]) || getAllSuggestions(getSuggestions);

    Promise.resolve(getSuggestionsFn(debouncedSearch, { maxSearchResults, showInternalKeys })).then(
      (suggestions) => !cancel && setSuggestions(suggestions),
    );

    return () => {
      cancel = true;
    };
  }, [debouncedSearch, sourceId]); //eslint-disable-line react-hooks/exhaustive-deps

  return (
    <MultiSourceComboBoxContext.Provider
      value={{ sources: Object.keys(getSuggestions), selected: sourceId, setSourceId }}
    >
      <ComboBox
        {...props}
        value={value}
        suggestions={suggestions}
        onChange={(input, selected) => {
          setSearch(input);
          onChange && onChange(input, selected);
        }}
        suggestionsContainer={MultiSourceSuggestionContainer}
      />
    </MultiSourceComboBoxContext.Provider>
  );
};

MultiSourceComboBox.propTypes = {
  getSuggestions: PropTypes.objectOf(PropTypes.func).isRequired,
};

export default MultiSourceComboBox;
