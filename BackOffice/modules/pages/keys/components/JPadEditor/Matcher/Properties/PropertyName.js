import React from 'react';
import R from 'ramda';
import style from './styles.css';
import ComboBox from '../../../../../../components/common/ComboBox/ComboBox';

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
    <ComboBox
      options={ R.uniqBy(x => x.value)([...suggestedValues]) }
      onChange={(selectedValue) =>
        mutate.apply(m =>
          m.updateKey(selectedValue.value)
            .updateValue((selectedValue.meta && selectedValue.meta.defaultValue) || ''))
      }
      placeholder="Property"
      selected={[R.find(x => x.value === property)(suggestedValues)]}
      renderMenuItemChildren={ (_, suggestion) => (<PropertySuggestion suggestion={suggestion} />) }
      autofocus={autofocus}
      wrapperThemeClass={style['property-name-wrapper']}
      />
  );
};
