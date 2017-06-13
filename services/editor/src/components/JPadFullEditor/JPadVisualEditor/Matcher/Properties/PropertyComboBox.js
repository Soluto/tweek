import React from 'react';
import Chance from 'chance';
import { compose, mapProps } from 'recompose';
import Highlighter from 'react-highlight-words';
import ReactTooltip from 'react-tooltip';
import MultiSourceComboBox from '../../../../common/ComboBox/MultiSourceComboBox';
import * as ContextService from '../../../../../services/context-service';
import * as SearchService from '../../../../../services/search-service';
import withPropertyTypeDetails from '../../../../../hoc/with-property-type-details';
import keyIcon from '../../../../../resources/key-icon.svg';
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

function getAvatarText(identity) {
  const identities = ContextService.getIdentities();
  const index = identities.indexOf(identity);
  if (index >= 0) {
    identities.splice(index, 1);
  }

  const lowerNames = identities.map(x => x.toLowerCase());

  let i = 1;
  while (i < identity.length) {
    const result = identity.substring(0, i).toLowerCase();
    if (!lowerNames.some(n => n.startsWith(result))) return result;
    i++;
  }
  return identity;
}

const Avatar = ({ identity, size = 28 }) =>
  <div
    style={{
      width: size,
      height: size,
      fontWeight: 'bold',
      fontSize: Math.floor(size / 2),
      lineHeight: `${size}px`,
      fontFamily: 'Helvetica, Arial, sans-serif',
      textAlign: 'center',
      textTransform: 'uppercase',
      color: '#6D6D6D',
      background: 'rgba(215, 215, 215, 0.49)',
      borderRadius: '50%',
      marginRight: 8,
      display: 'inline-block',
    }}
  >
    {identity === 'keys' ? <img src={keyIcon} /> : getAvatarText(identity)}
  </div>;

const PropertySuggestion = compose(
  mapProps(({ suggestion, ...props }) => {
    const property = suggestion.value;
    const [identity, propName] = suggestion.value.split('.');
    const tooltipId = chance.guid();

    return { ...props, property, identity, propName, tooltipId };
  }),
  withPropertyTypeDetails('typeDetails'),
)(({ identity, propName, tooltipId, typeDetails, textToMark }) =>
  <div data-tip data-for={tooltipId} className={'property-suggestion-wrapper'}>
    <Avatar identity={identity} />
    <Highlighter
      highlightClassName={'suggestion-label'}
      highlightStyle={HIGHLIGHTED_TEXT_INLINE_STYLE}
      searchWords={[textToMark]}
      textToHighlight={propName}
    />
    <ReactTooltip
      id={tooltipId}
      place="right"
      type="dark"
      effect="solid"
      delayShow={1000}
      delayHide={1000}
    >
      <PropertyTooltip
        propName={propName}
        identityType={identity}
        propType={typeDetails.name}
        description={typeDetails.description || ''}
      />
    </ReactTooltip>
  </div>,
);

PropertySuggestion.displayName = 'PropertySuggestion';

const getProperty = (suggestedValues, property) => {
  const result = suggestedValues.find(x => x.value === property);
  return result ? result.label : property;
};

const PropertyComboBox = ({ property, suggestedValues, onPropertyChange, autofocus }) =>
  <MultiSourceComboBox
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

export default PropertyComboBox;
