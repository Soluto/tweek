import React from 'react';
import R from 'ramda';
import style from './styles.css';
import ComboBox from '../../../../../../components/common/ComboBox/ComboBox';
import { withState } from 'recompose';
import Highlighter from 'react-highlight-words';

const HIGHLIGHTED_TEXT_INLINE_STYLE = {
  fontWeight: 800,
  backgroundColor: 'transparent',
  color: 'gray',
};

let PropertySuggestion = ({ suggestion, textToMark }) => {
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
    return (
      <ComboBox
        options={ R.uniqBy(x => x.value)([...suggestedValues]) }
        onChange={(selectedValue) =>
          mutate.apply(m =>
            m.updateKey(selectedValue.value)
              .updateValue((selectedValue.meta && selectedValue.meta.defaultValue) || ''))
        }
        placeholder="Property"
        selected={[R.find(x => x.value === property)(suggestedValues)]}
        onInputChange={text => {
          setCurrentInputValue(text);
        } }
        filterBy={ option => option.value.toLowerCase().includes(currentInputValue) }
        renderMenuItemChildren={ (_, suggestion) => (<PropertySuggestion suggestion={suggestion} textToMark={currentInputValue}/>) }
        autofocus={autofocus}
        wrapperThemeClass={style['property-name-wrapper']}
      />
    );
  });
