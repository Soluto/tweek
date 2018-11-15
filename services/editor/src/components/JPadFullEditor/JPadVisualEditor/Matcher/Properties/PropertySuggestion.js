import React from 'react';
import Chance from 'chance';
import { compose, mapProps } from 'recompose';
import Highlighter from 'react-highlight-words';
import ReactTooltip from 'react-tooltip';
import withPropertyTypeDetails from '../../../../../hoc/with-property-type-details';
import Avatar from './Avatar';
import './styles.css';

const chance = new Chance();

const HIGHLIGHTED_TEXT_INLINE_STYLE = {
  fontWeight: 800,
  backgroundColor: 'transparent',
  color: 'gray',
};

const PropertyTooltip = ({ propName, description, propType, identityType }) =>
  <div>
    <div style={{ fontSize: 18 }}>
      <span>{identityType}</span>.<span>{propName}</span>
    </div>
    <div style={{ display: 'flex', marginTop: 10 }}>
      <div style={{ minWidth: 200, maxWidth: 400 }}>
        {description}
      </div>
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

const PropertySuggestion = compose(
  mapProps(({ suggestion, ...props }) => {
    const property = suggestion.value;
    const [identity, propName] = suggestion.value.split('.');
    const tooltipId = chance.guid();

    return { ...props, property, identity, propName, tooltipId };
  }),
  withPropertyTypeDetails('typeDetails'),
)(({ identity, propName, tooltipId, typeDetails, textToMark }) =>
  <div
    data-comp="property-suggestion"
    data-value={`${identity}.${propName}`}
    className="property-suggestion-wrapper"
    data-tip
    data-for={tooltipId}
    data-place="right"
    data-effect="solid"
    data-delay-show={1000}
    data-delay-hide={1000}
  >
    <Avatar identity={identity} />
    <Highlighter
      highlightClassName="suggestion-label"
      highlightStyle={HIGHLIGHTED_TEXT_INLINE_STYLE}
      searchWords={[textToMark]}
      textToHighlight={propName}
    />
    <ReactTooltip id={tooltipId}>
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

export default PropertySuggestion;
