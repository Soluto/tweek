import React from 'react';
import R from 'ramda';
import style from './styles.css';
import Typeahead from 'react-bootstrap-typeahead';

let PropertySuggestion = ({ suggestion }) => {
  const [identity, prop] = suggestion.value.split('.');
  const type = suggestion.meta && (suggestion.meta.typeAlias || suggestion.meta.type);
  return (
    <div className={style['property-suggestion-wrapper']}>
      <span className={style['suggestion-label']}>{prop}</span><span className={style['suggestion-type']}>({type}) </span>
      <div className={style['suggestion-identity']}>{identity}</div>
    </div>
  );
};

let getPropertyDisplayName = prop => prop === '' ? prop : prop.split('.')[1];

export default ({ mutate, property, suggestedValues, autofocus }) => {
  return (
    <div className={style['property-name-wrapper']} >
      <Typeahead
        options={ R.uniqBy(x => x.value)([...suggestedValues]) }
        onChange={(selectedValues) => {
          if (selectedValues.length < 1) return;
          const selectedOption = selectedValues[0];
          mutate.apply(m =>
            m.updateKey(selectedOption.value)
              .updateValue((selectedOption.meta && selectedOption.meta.defaultValue) || ''));
        } }
        placeholder="Property"
        selected={[R.find(x => x.value === property)(suggestedValues)]}
        renderMenuItemChildren={ (_, suggestion) => (<PropertySuggestion suggestion={suggestion} />) }
        ref={e => e && autofocus && e.refs.instance.focus() }
      />
    </div >
  );
};
