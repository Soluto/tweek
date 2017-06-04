import React from 'react';
import Chance from 'chance';
import Highlighter from 'react-highlight-words';
import ReactTooltip from 'react-tooltip';
import MultiSourceComboBox from '../../../../common/ComboBox/MultiSourceComboBox';
import * as ContextService from '../../../../../services/context-service';
import * as SearchService from '../../../../../services/search-service';
import './styles.css';

const chance = new Chance();

const HIGHLIGHTED_TEXT_INLINE_STYLE = {
  fontWeight: 800,
  backgroundColor: 'transparent',
  color: 'gray',
};

const PropertyTooltip = ({ propName, description, propType, identityType }) =>
  <div>
    <div style={{ fontSize: 18 }}><span>{identityType}</span>.<span>{propName}</span></div>
    <div style={{ display: 'flex', marginTop: 10 }}>
      <div style={{ minWidth: 200, maxWidth: 400 }}>{description}</div>
      <div
        style={{
          textAlign: 'center',
          height: 60,
          marginLeft: 40,
          borderLeftColor: '#ffffff',
          borderLeftStyle: 'solid',
          borderLeftWidth: 1,
          paddingLeft: 18,
          fontSize: 14,
        }}
      >
        <div style={{ marginBottom: 10 }}>Property Type</div>
        <div>
          {propType}
        </div>
      </div>
    </div>
  </div>;

const PropertySuggestion = ({ suggestion, textToMark }) => {
  if (suggestion.value.startsWith(ContextService.KEYS_IDENTITY)) {
    return (
      <div className={'property-suggestion-wrapper'} data-field-type={'string'}>
        <i />
        <Highlighter
          highlightClassName={'suggestion-label'}
          highlightStyle={HIGHLIGHTED_TEXT_INLINE_STYLE}
          searchWords={[textToMark]}
          textToHighlight={suggestion.label}
        />
        <span className={'suggestion-identity'}>(keys)</span>
      </div>
    );
  }

  const typeDetails = ContextService.getPropertyTypeDetails(suggestion.value);
  const [identity, prop] = suggestion.value.split('.');
  const tooltipId = chance.guid();

  return (
    <div
      data-tip
      data-for={tooltipId}
      className={'property-suggestion-wrapper'}
      data-field-type={typeDetails.name}
    >
      <i />
      <Highlighter
        highlightClassName={'suggestion-label'}
        highlightStyle={HIGHLIGHTED_TEXT_INLINE_STYLE}
        searchWords={[textToMark]}
        textToHighlight={prop}
      />
      <span className={'suggestion-identity'}>
        (
        <Highlighter
          highlightClassName={'suggestion-label'}
          highlightStyle={HIGHLIGHTED_TEXT_INLINE_STYLE}
          searchWords={[textToMark]}
          textToHighlight={identity}
        />
        )
      </span>
      <ReactTooltip
        id={tooltipId}
        place="right"
        type="dark"
        effect="solid"
        delayShow={1000}
        delayHide={1000}
      >
        <PropertyTooltip
          propName={prop}
          identityType={identity}
          propType={typeDetails.name}
          description={typeDetails.description || ''}
        />
      </ReactTooltip>
    </div>
  );
};

const getProperty = (suggestedValues, property) => {
  const result = suggestedValues.find(x => x.value === property);
  return result ? result.label : property;
};

export default ({ property, suggestedValues, onPropertyChange, autofocus }) =>
  <MultiSourceComboBox
    getSuggestions={{
      Context: () => suggestedValues,
      Keys: (query) => {
        const search = query.startsWith(ContextService.KEYS_IDENTITY)
          ? query.substring(ContextService.KEYS_IDENTITY.length)
          : query;
        return SearchService.suggestions(search).map(label => ({
          label,
          value: `${ContextService.KEYS_IDENTITY}${label}`,
        }));
      },
    }}
    value={getProperty(suggestedValues, property)}
    onChange={(input, selected) => {
      if (selected) onPropertyChange(selected);
      else if (input.startsWith('@@key:') || input.startsWith(ContextService.KEYS_IDENTITY)) {
        onPropertyChange({ value: input.replace('@@key:', ContextService.KEYS_IDENTITY) });
      }
    }}
    placeholder="Property"
    filterBy={(currentInputValue, option) =>
      option.value.toLowerCase().includes(currentInputValue.toLowerCase())}
    renderSuggestion={(suggestion, currentInputValue) =>
      <PropertySuggestion suggestion={suggestion} textToMark={currentInputValue} />}
    autofocus={autofocus}
    className={'property-name-wrapper'}
    showValueInOptions
  />;
