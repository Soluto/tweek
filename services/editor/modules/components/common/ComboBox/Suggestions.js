import React, { PropTypes } from 'react';
import classnames from 'classnames';

const suggestionType = PropTypes.oneOfType([
  PropTypes.string,
  PropTypes.object,
]);

const SuggestionItem = ({ className, suggestion, isSelected, getLabel, ...props }) => (
  <div className={classnames(className, 'combo-box-suggestion-wrapper', { isSelected })} {...props}>
    {getLabel(suggestion)}
  </div>
);

SuggestionItem.propTypes = {
  suggestion: suggestionType.isRequired,
  getLabel: PropTypes.func.isRequired,
  isSelected: PropTypes.bool.isRequired,
};

const Suggestions = ({suggestions, getLabel, highlightedSuggestion, onSuggestionSelected, onSuggestionHighlighted}) => (
  <div className="combo-box-suggestions-container">
    {
      suggestions.map((x,i) => <SuggestionItem
        key={`${i}_${getLabel(x)}`}
        isSelected={highlightedSuggestion === i}
        suggestion={x}
        onClick={() => onSuggestionSelected(i)}
        onMouseOver={() => onSuggestionHighlighted(i)}
        getLabel={getLabel}
      />)
    }
  </div>
);

Suggestions.propTypes = {
  suggestions: PropTypes.arrayOf(suggestionType).isRequired,
  getLabel: PropTypes.func.isRequired,
  highlightedSuggestion: PropTypes.number.isRequired,
  onSuggestionSelected: PropTypes.func.isRequired,
  onSuggestionHighlighted: PropTypes.func.isRequired,
};

export default Suggestions;