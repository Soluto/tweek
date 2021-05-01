import classnames from 'classnames';
import React, {
  ComponentType,
  KeyboardEventHandler,
  ReactElement,
  useEffect,
  useState,
} from 'react';
import Input, { InputProps } from '../Input/Input';
import { useClickOutside } from './ClickOutside';
import './ComboBox.css';
import Suggestions from './Suggestions';

const keyCode = {
  ENTER: 13,
  UP: 38,
  RIGHT: 39,
  DOWN: 40,
  TAB: 9,
};

function createCase(matchCase: boolean, x: string): string;
function createCase<T extends (...args: any[]) => string>(matchCase: boolean, x: T): T;
function createCase(matchCase: boolean, x: string | Function) {
  if (x === undefined || matchCase) {
    return x;
  }
  if (typeof x === 'function') {
    return (...args: any[]) => x(...args).toLowerCase();
  }
  return x.toLowerCase();
}

const defaultGetLabel = (obj: any) => {
  if (obj === undefined) {
    return '';
  }
  return obj.label === undefined ? obj.toString() : obj.label;
};

type BaseComboBoxProps<T> = {
  value?: string;
  onChange?: (input: string, selected?: T) => void;
  filterBy?: (input: string, item: T) => boolean;
  getLabel?: (item: T) => string;
  suggestions: T[];
  suggestionsLimit?: number;
  showValueInOptions?: boolean;
  matchCase?: boolean;
  renderSuggestion?: (item: T, value: string) => ReactElement;
  suggestionsContainer?: ComponentType;
  className?: string;
};

export type ComboBoxProps<T> = BaseComboBoxProps<T> & Omit<InputProps, keyof BaseComboBoxProps<T>>;

const ComboBox = <T,>({
  value: initialValue = '',
  onChange: originalOnChange,
  suggestions: initialSuggestions,
  filterBy,
  matchCase = false,
  getLabel = defaultGetLabel,
  showValueInOptions = false,
  suggestionsLimit = 10,

  className,
  disabled,
  suggestionsContainer,
  renderSuggestion,

  onKeyDown,
  ...props
}: ComboBoxProps<T>) => {
  const [hasFocus, setFocus] = useState(false);
  const [value, setValue] = useState(initialValue);
  const [highlighted, setHighlighted] = useState<{ index: number; suggestion?: T }>({ index: -1 });

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const filterSuggestions = () => {
    const getCaseLabel = createCase(matchCase, getLabel);

    const filterFunc =
      filterBy ||
      ((input, suggestion) =>
        input === '' || getCaseLabel(suggestion).includes(createCase(matchCase, input)));

    const filteredSuggestions = initialSuggestions.filter((s) => filterFunc(value, s));
    if (
      !showValueInOptions &&
      filteredSuggestions.length === 1 &&
      getCaseLabel(filteredSuggestions[0]) === createCase(matchCase, value)
    ) {
      return [];
    }
    if (suggestionsLimit > 0) {
      return filteredSuggestions.slice(0, suggestionsLimit);
    }
    return filteredSuggestions;
  };

  const suggestions = filterSuggestions();
  const highlightedSuggestion = highlighted.index;

  const onSuggestionHighlighted = (index: number) =>
    setHighlighted({ index, suggestion: initialSuggestions[index] });

  const onChange = (input: string, selected?: T) => {
    setValue(input);
    originalOnChange && originalOnChange(input, selected);
  };

  const getSuggestion = (index: number) => suggestions[Math.max(0, index)];

  const onSuggestionSelected = (index: number) => {
    const selected = getSuggestion(index);
    onChange(getLabel(selected), selected);
    setFocus(false);
  };

  const onInputChange = (input: string) => {
    const caseInput = createCase(matchCase, input);
    const getLabelWithCase = createCase(matchCase, getLabel);
    const selected = suggestions.find((s) => getLabelWithCase(s) === caseInput);
    onChange(input, selected);
    setFocus(true);
  };

  const handleKeyDown: KeyboardEventHandler<HTMLInputElement> = (e) => {
    switch (e.keyCode) {
      case keyCode.TAB:
        if (suggestions.length > 0) {
          const selected = getSuggestion(highlightedSuggestion);
          if (getLabel(selected) !== value) {
            onSuggestionSelected(highlightedSuggestion);
            e.preventDefault();
            break;
          }
        }
        setFocus(false);
        break;
      case keyCode.RIGHT:
      case keyCode.ENTER:
        if (suggestions.length > 0) {
          onSuggestionSelected(highlightedSuggestion);
        }
        break;
      case keyCode.DOWN:
        if (highlightedSuggestion < suggestions.length - 1) {
          onSuggestionHighlighted(highlightedSuggestion + 1);
        } else {
          onSuggestionHighlighted(-1);
        }
        e.preventDefault();
        break;
      case keyCode.UP:
        if (highlightedSuggestion === -1) {
          onSuggestionHighlighted(suggestions.length - 1);
        } else {
          onSuggestionHighlighted(highlightedSuggestion - 1);
        }
        e.preventDefault();
        break;
      default:
        break;
    }

    if (onKeyDown) {
      onKeyDown(e);
    }
  };

  const ref = useClickOutside(() => setFocus(false));

  return (
    <div
      className={classnames('combo-box-default-wrapper-theme-class', className)}
      onFocus={() => setFocus(true)}
      ref={ref}
    >
      <div data-comp="ComboBox" className="bootstrap-typeahead">
        <Input
          className="bootstrap-typeahead-input"
          {...props}
          value={value}
          disabled={disabled}
          onChange={onInputChange}
          onKeyDown={handleKeyDown}
        />
        {hasFocus && !disabled && (
          <Suggestions
            {...{
              value,
              suggestions,
              getLabel,
              highlightedSuggestion,
              onSuggestionHighlighted,
              renderSuggestion,
              suggestionsContainer,
            }}
            onSuggestionSelected={onSuggestionSelected}
          />
        )}
      </div>
    </div>
  );
};

export default ComboBox;
