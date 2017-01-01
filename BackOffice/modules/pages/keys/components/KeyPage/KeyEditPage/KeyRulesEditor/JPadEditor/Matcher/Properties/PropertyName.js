import React from 'react';
import R from 'ramda';
import style from './styles.css';
import ComboBox from '../../../../../../../../../components/common/ComboBox/ComboBox';
import { withState } from 'recompose';
import Highlighter from 'react-highlight-words';
import { types as MetaTypes } from '../../../../../../../../../services/MetaHelpers';

const HIGHLIGHTED_TEXT_INLINE_STYLE = {
  fontWeight: 800,
  backgroundColor: 'transparent',
  color: 'gray',
};

let PropertySuggestion = ({ suggestion, textToMark }) => {

  if (suggestion.value.startsWith('@@key:')) {
    return (
      <div className={style['property-suggestion-wrapper']}>
        <div className={style['suggestion-identity']}><Highlighter
          highlightClassName={style['suggestion-label']}
          highlightStyle={HIGHLIGHTED_TEXT_INLINE_STYLE}
          searchWords={[textToMark]}
          textToHighlight={suggestion.value}
          /></div>
      </div>);
  }

  const [identity, prop] = suggestion.value.split('.');
  const type = suggestion.meta && (suggestion.meta.typeAlias || suggestion.meta.type);

  return (
    <div className={style['property-suggestion-wrapper']}>
      <Highlighter
        highlightClassName={style['suggestion-label']}
        highlightStyle={HIGHLIGHTED_TEXT_INLINE_STYLE}
        searchWords={[textToMark]}
        textToHighlight={prop}
        />
      <span className={style['suggestion-type']}>({type}) </span>
      <div className={style['suggestion-identity']}><Highlighter
        highlightClassName={style['suggestion-label']}
        highlightStyle={HIGHLIGHTED_TEXT_INLINE_STYLE}
        searchWords={[textToMark]}
        textToHighlight={identity}
        /></div>
    </div>
  );
};


export default withState('currentInputValue', 'setCurrentInputValue', '')(
  ({ mutate, property, suggestedValues, autofocus, currentInputValue, setCurrentInputValue }) => {
    const selectProperty = (newProperty) => mutate.apply(m =>
      m.updateKey(newProperty.value)
        .updateValue((newProperty.meta && newProperty.meta.defaultValue) || ''));

    if (!!property && !suggestedValues.some(x => x.value === property)) {
      suggestedValues = [...suggestedValues, { label: property, value: property, meta: MetaTypes.string }];
    }

    suggestedValues = R.uniqBy(x => x.value)([...suggestedValues]);

    return (
      <ComboBox
        options={suggestedValues}
        onChange={selectProperty}
        placeholder="Property"
        selected={[R.find(x => x.value === property)(suggestedValues)]}
        onInputChange={text => {
          setCurrentInputValue(text);
          if (text.startsWith('@@key:')) {
            selectProperty({ value: text });
          }
        } }
        filterBy={ option => option.value.toLowerCase().includes(currentInputValue) }
        renderMenuItemChildren={ (_, suggestion) => (<PropertySuggestion suggestion={suggestion} textToMark={currentInputValue}/>) }
        autofocus={autofocus}
        wrapperThemeClass={style['property-name-wrapper']}
        />
    );
  });
