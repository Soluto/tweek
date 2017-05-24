import React, { PropTypes } from 'react';
import classnames from 'classnames';

const SuggestionItem = ({ children, className, onSelect, active, disabled, ...props }) => (
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
  </li>
);

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

const Suggestions = ({ suggestions, getLabel, highlightedSuggestion, onSuggestionSelected, onSuggestionHighlighted, renderSuggestion }) => (
  <ul className="combo-box-suggestions-container">
    {
      suggestions.map((x, i) => (
        <SuggestionItem
          key={`${i}_${getLabel(x)}`}
          onSelect={() => onSuggestionSelected(i)}
          active={highlightedSuggestion === i}
          className="combo-box-suggestion-item"
        >
          { renderSuggestion ? renderSuggestion(x) : getLabel(x) }
        </SuggestionItem>
      ))
    }
  </ul>
);

Suggestions.propTypes = {
  suggestions: PropTypes.arrayOf(PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.object,
  ])).isRequired,
  getLabel: PropTypes.func.isRequired,
  highlightedSuggestion: PropTypes.number.isRequired,
  onSuggestionSelected: PropTypes.func.isRequired,
  onSuggestionHighlighted: PropTypes.func.isRequired,
  renderSuggestion: PropTypes.func,
};

export default Suggestions;
