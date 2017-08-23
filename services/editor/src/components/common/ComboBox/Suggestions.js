import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import Highlighter from 'react-highlight-words';

const SuggestionItem = ({ children, className, onSelect, active, label, disabled, ...props }) =>
  <li className={classnames(className, { active, disabled })} {...props}>
    <a
      role="button"
      onClick={(e) => {
        e.preventDefault();
        !disabled && onSelect(e);
      }}
    >
      {children}
    </a>
  </li>;

SuggestionItem.propTypes = {
  className: PropTypes.string,
  onSelect: PropTypes.func.isRequired,
  active: PropTypes.bool,
  disabled: PropTypes.bool,
};

SuggestionItem.defaultProps = {
  active: false,
  disabled: false,
};

const highlightStyle = { fontWeight: 'bold', background: 'inherit', color: 'inherit' };

const Suggestions = ({
  suggestions,
  value,
  getLabel,
  highlightedSuggestion,
  onSuggestionSelected,
  onSuggestionHighlighted,
  renderSuggestion,
  suggestionsContainer: Container,
}) =>
  <Container>
    {suggestions.map((x, i) =>
      <SuggestionItem
        data-label={getLabel(x)}
        key={`${i}_${getLabel(x)}`}
        onSelect={() => onSuggestionSelected(i)}
        active={highlightedSuggestion === i}
        onMouseOver={() => onSuggestionHighlighted(i)}
      >
        {renderSuggestion
          ? renderSuggestion(x, value)
          : <Highlighter
              highlightStyle={highlightStyle}
              searchWords={value.split(' ')}
              textToHighlight={getLabel(x)}
            />}
      </SuggestionItem>,
    )}
  </Container>;

Suggestions.propTypes = {
  value: PropTypes.string.isRequired,
  suggestions: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.object]))
    .isRequired,
  getLabel: PropTypes.func.isRequired,
  highlightedSuggestion: PropTypes.number.isRequired,
  onSuggestionSelected: PropTypes.func.isRequired,
  onSuggestionHighlighted: PropTypes.func.isRequired,
  renderSuggestion: PropTypes.func,
  suggestionsContainer: PropTypes.any,
};

Suggestions.defaultProps = {
  suggestionsContainer: ({ children, ...props }) =>
    <div style={{ display: 'flex', position: 'relative' }}>
      <ul
        {...props}
        data-field="suggestions"
        className="bootstrap-typeahead-menu dropdown-menu dropdown-menu-justify"
        style={{ display: 'block', overflow: 'auto', maxHeight: '300px' }}
      >
        {children}
      </ul>
    </div>,
};

export default Suggestions;
