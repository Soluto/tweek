import React from 'react';
import MultiSourceComboBox from '../../../../common/ComboBox/MultiSourceComboBox';
import ValidationIcon from '../../../../common/ValidationIcon';
import * as ContextService from '../../../../../services/context-service';
import * as SearchService from '../../../../../services/search-service';
import Avatar from './Avatar';
import PropertySuggestion from './PropertySuggestion';
import './styles.css';

const getProperty = (suggestedValues, property) => {
  const result = suggestedValues.find(x => x.value === property);
  return result ? result.label : property;
};

const PropertyComboBox = ({ property, suggestedValues, warning, ...props }) => {
  property = property.replace(/^@@key:/, ContextService.KEYS_IDENTITY);
  const [identity] = property.split('.');

  return (
    <div className="property-combobox-container">
      <Avatar identity={identity} className="property-avatar" />
      <MultiSourceComboBox
        {...props}
        getSuggestions={{
          Context: () => suggestedValues,
          Keys: (query) => {
            const search = query.startsWith(ContextService.KEYS_IDENTITY)
              ? query.substring(ContextService.KEYS_IDENTITY.length)
              : query;
            return SearchService.getSuggestions(search).then(suggestions =>
              suggestions.map(label => ({
                label,
                value: `${ContextService.KEYS_IDENTITY}${label}`,
              })),
            );
          },
        }}
        value={getProperty(suggestedValues, property)}
        placeholder="Property"
        filterBy={(currentInputValue, option) =>
          option.value.toLowerCase().includes(currentInputValue.toLowerCase())}
        renderSuggestion={(suggestion, currentInputValue) =>
          <PropertySuggestion suggestion={suggestion} textToMark={currentInputValue} />}
        className="property-name-wrapper"
        showValueInOptions
      />
      <ValidationIcon show={warning} hint="Unknown identity" />
    </div>
  );
};

export default PropertyComboBox;
