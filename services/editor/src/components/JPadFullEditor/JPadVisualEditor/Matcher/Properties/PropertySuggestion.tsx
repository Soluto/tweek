import React, { useRef } from 'react';
import Highlighter from 'react-highlight-words';
import ReactTooltip from 'react-tooltip';
import { v4 as uuid } from 'uuid';
import Avatar from './Avatar';
import './styles.css';
import { usePropertyTypeDetails } from './usePropertyTypeDetails';

const HIGHLIGHTED_TEXT_INLINE_STYLE = {
  fontWeight: 800,
  backgroundColor: 'transparent',
  color: 'gray',
};

type PropertyTooltipProps = {
  identityType: string;
  propName: string;
  description?: string;
  propType: string | undefined;
};

const PropertyTooltip = ({
  propName,
  description,
  propType,
  identityType,
}: PropertyTooltipProps) => (
  <div>
    <div style={{ fontSize: 18 }}>
      <span>{identityType}</span>.<span>{propName}</span>
    </div>
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
        <div>{propType}</div>
      </div>
    </div>
  </div>
);

export type PropertySuggestionProps = {
  textToMark: string;
  suggestion: { value: string };
};

const PropertySuggestion = ({ suggestion, textToMark }: PropertySuggestionProps) => {
  const property = suggestion.value;
  const [identity, propName] = suggestion.value.split('.');
  const tooltipId = useRef(uuid());

  const typeDetails = usePropertyTypeDetails(property);

  return (
    <div
      data-comp="property-suggestion"
      data-value={`${identity}.${propName}`}
      className="property-suggestion-wrapper"
      data-tip
      data-for={tooltipId.current}
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
      <ReactTooltip id={tooltipId.current}>
        <PropertyTooltip propName={propName} identityType={identity} propType={typeDetails.name} />
      </ReactTooltip>
    </div>
  );
};

export default PropertySuggestion;
