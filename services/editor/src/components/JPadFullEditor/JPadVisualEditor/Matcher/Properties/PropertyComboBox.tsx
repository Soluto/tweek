import React from 'react';
import { KEYS_IDENTITY } from '../../../../../contexts/Schema/utils';
import * as SearchService from '../../../../../services/search-service';
import { useMaxSearchResults, useShowInternalKeys } from '../../../../../utils';
import { MultiSourceComboBox, ValidationIcon } from '../../../../common';
import Avatar from './Avatar';
import PropertySuggestion from './PropertySuggestion';
import './styles.css';

export type Suggestion = {
  value: string;
  label: string;
  defaultValue?: string;
};

const getProperty = (suggestedValues: Suggestion[], property: string) => {
  const result = suggestedValues.find((x) => x.value === property);
  return result ? result.label : property;
};

export type PropertyComboBoxProps = {
  property: string;
  suggestedValues: Suggestion[];
  warning: boolean;
  onFocus?: (focused: boolean) => void;
  onChange: (input: string, selected?: Suggestion) => void;
  autofocus?: boolean;
};

const PropertyComboBox = ({
  property,
  suggestedValues,
  warning,
  ...props
}: PropertyComboBoxProps) => {
  const maxSearchResults = useMaxSearchResults();
  const showInternalKeys = useShowInternalKeys();

  property = property.replace(/^@@key:/, KEYS_IDENTITY);
  const [identity] = property.split('.');

  return (
    <div className="property-combobox-container">
      <Avatar identity={identity} className="property-avatar" />
      <MultiSourceComboBox
        {...props}
        getSuggestions={{
          Context: () => suggestedValues,
          Keys: (query) => {
            const search = query.startsWith(KEYS_IDENTITY)
              ? query.substring(KEYS_IDENTITY.length)
              : query;
            return SearchService.getSuggestions(search, {
              maxSearchResults,
              showInternalKeys,
            }).then((suggestions) =>
              suggestions.map((label) => ({
                label,
                value: `${KEYS_IDENTITY}${label}`,
              })),
            );
          },
        }}
        value={getProperty(suggestedValues, property)}
        placeholder="Property"
        filterBy={(currentInputValue, option) =>
          option.value.toLowerCase().includes(currentInputValue.toLowerCase())
        }
        renderSuggestion={(suggestion, currentInputValue) => (
          <PropertySuggestion suggestion={suggestion} textToMark={currentInputValue} />
        )}
        className="property-name-wrapper"
        showValueInOptions
      />
      <ValidationIcon show={warning} hint="Unknown identity" />
    </div>
  );
};

export default PropertyComboBox;
