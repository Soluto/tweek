import React from 'react';
import R from 'ramda';
import style from './styles.css';
import ComboBox from '../../../../../../../../../components/common/ComboBox/ComboBox';
import {withState} from 'recompose';
import Highlighter from 'react-highlight-words';
import ReactTooltip from 'react-tooltip';
import * as ContextService from '../../../../../../../../../services/context-service';

const HIGHLIGHTED_TEXT_INLINE_STYLE = {
  fontWeight: 800,
  backgroundColor: 'transparent',
  color: 'gray',
};

let PropertyTooltip = ({propName, description, propType, identityType}) =>
  <div>
    <div style={{fontSize: 18}}><span>{identityType}</span>.<span>{propName}</span></div>
    <div style={{display: "flex", marginTop: 10}}>
      <div style={{minWidth: 200, maxWidth: 400}}>{description}</div>
      <div style={{
        textAlign: "center",
        height: 60,
        marginLeft: 40,
        borderLeftColor: "#ffffff",
        borderLeftStyle: "solid",
        borderLeftWidth: 1,
        paddingLeft: 18,
        fontSize: 14
      }}>
        <div style={{marginBottom: 10}}>Property Type</div>
        <div>
          {propType}
        </div>
      </div>
    </div>
  </div>;


let PropertySuggestion = ({suggestion, textToMark}) => {

  if (suggestion.value.startsWith('@@key:')) {
    return (
      <div className={style['property-suggestion-wrapper']}>
        <div className={style['suggestion-identity']}>
          <Highlighter
            highlightClassName={style['suggestion-label']}
            highlightStyle={HIGHLIGHTED_TEXT_INLINE_STYLE}
            searchWords={[textToMark]}
            textToHighlight={suggestion.value}
          />
        </div>
      </div>);
  }

  const typeDetails = ContextService.getPropertyTypeDetails(suggestion.value);
  const [identity, prop] = suggestion.value.split('.');
  const tooltipId = chance.guid();

  return (
    <div data-tip data-for={tooltipId} className={style['property-suggestion-wrapper']}
         data-field-type={typeDetails.name}>
      <i />
      <Highlighter
        highlightClassName={style['suggestion-label']}
        highlightStyle={HIGHLIGHTED_TEXT_INLINE_STYLE}
        searchWords={[textToMark]}
        textToHighlight={prop}
      />
      <span className={style['suggestion-identity']}>(<Highlighter
        highlightClassName={style['suggestion-label']}
        highlightStyle={HIGHLIGHTED_TEXT_INLINE_STYLE}
        searchWords={[textToMark]}
        textToHighlight={identity}
      />)</span>
      <ReactTooltip id={tooltipId}
                    place="right"
                    type="dark"
                    effect="solid"
                    delayShow={1000}
                    delayHide={1000}>
        <PropertyTooltip propName={prop}
                         identityType={identity}
                         propType={typeDetails.name}
                         description={typeDetails.description || ""}/>
      </ReactTooltip>
    </div>
  );
};


export default withState('currentInputValue', 'setCurrentInputValue', '')(
  ({mutate, property, suggestedValues, autofocus, currentInputValue, setCurrentInputValue}) => {
    const selectProperty = (newProperty) => mutate.apply(m =>
      m.updateKey(newProperty.value)
        .updateValue((newProperty && newProperty.defaultValue) || ''));

    if (!!property && !suggestedValues.some(x => x.value === property)) {
      suggestedValues = [...suggestedValues, {label: property, value: property}];
    }

    suggestedValues = R.uniqBy(x => x.value)([...suggestedValues]);

    return (
      <ComboBox
        options={suggestedValues}
        onChange={selectProperty}
        placeholder="Property"
        selected={suggestedValues.filter(x => x.value === property)}
        onInputChange={text => {
          setCurrentInputValue(text);
          if (text.startsWith('@@key:')) {
            selectProperty({value: text});
          }
        }}
        filterBy={option => option.value.toLowerCase().includes(currentInputValue.toLowerCase())}
        renderMenuItemChildren={(_, suggestion) => (
          <PropertySuggestion suggestion={suggestion} textToMark={currentInputValue}/>
        )}
        autofocus={autofocus}
        wrapperThemeClass={style['property-name-wrapper']}
      />
    );
  });
