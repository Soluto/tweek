import React from 'react';
import R from 'ramda';
import ClosedComboBox from '../../../../../../components/common/ClosedComboBox/ClosedComboBox';
import style from './styles.css';

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
    <ClosedComboBox
      inputProps={{
        value: getPropertyDisplayName(property),
        placeholder: 'Property',
        onChange: (selectedOption) =>
          mutate.apply(m =>
            m.updateKey(selectedOption.value)
              .updateValue((selectedOption.meta && selectedOption.meta.defaultValue) || '')),
      }}
      autofocus={autofocus}
      renderSuggestion={ suggestion => (<PropertySuggestion suggestion={suggestion} />) }
      suggestions={R.uniqBy(x => x.value)([...suggestedValues]) }
      />
  );
};
