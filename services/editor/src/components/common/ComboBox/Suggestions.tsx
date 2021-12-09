import classnames from 'classnames';
import React, {
  ComponentProps,
  ComponentType,
  CSSProperties,
  FunctionComponent,
  ReactElement,
} from 'react';
import Highlighter from 'react-highlight-words';

type SuggestionItemProps = ComponentProps<'li'> & {
  onSelect: () => void;
  active?: boolean;
};

const SuggestionItem: FunctionComponent<SuggestionItemProps> = ({
  children,
  className,
  onSelect,
  active,
  ...props
}) => (
  <li className={classnames(className, { active })} {...props}>
    <button onClick={onSelect}>{children}</button>
  </li>
);

const DefaultSuggestionsContainer: FunctionComponent = ({ children }) => (
  <div style={{ display: 'flex', position: 'relative' }}>
    <ul
      data-field="suggestions"
      className="bootstrap-typeahead-menu dropdown-menu dropdown-menu-justify"
      style={{ display: 'block', overflow: 'auto', maxHeight: '300px' }}
    >
      {children}
    </ul>
  </div>
);

const highlightStyle: CSSProperties = {
  fontWeight: 'bold',
  background: 'inherit',
  color: 'inherit',
};

export type SuggestionsProps<T> = {
  value: string;
  suggestions: Array<T>;
  getLabel: (item: T) => string;
  highlightedSuggestion: number;
  onSuggestionSelected: (i: number) => void;
  onSuggestionHighlighted: (i: number) => void;
  renderSuggestion?: (item: T, value: string) => ReactElement;
  suggestionsContainer?: ComponentType;
};

const Suggestions = <T,>({
  suggestions,
  value,
  getLabel,
  highlightedSuggestion,
  onSuggestionSelected,
  onSuggestionHighlighted,
  renderSuggestion,
  suggestionsContainer: Container = DefaultSuggestionsContainer,
}: SuggestionsProps<T>) => (
  <Container>
    {suggestions.map((x, i) => (
      <SuggestionItem
        data-label={getLabel(x)}
        key={`${i}_${getLabel(x)}`}
        onSelect={() => onSuggestionSelected(i)}
        active={highlightedSuggestion === i}
        onMouseOver={() => onSuggestionHighlighted(i)}
      >
        {renderSuggestion ? (
          renderSuggestion(x, value)
        ) : (
          <Highlighter
            highlightStyle={highlightStyle}
            searchWords={value.split(' ')}
            textToHighlight={getLabel(x)}
          />
        )}
      </SuggestionItem>
    ))}
  </Container>
);

export default Suggestions;
