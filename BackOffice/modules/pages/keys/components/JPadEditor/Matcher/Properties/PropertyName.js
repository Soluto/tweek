import React from 'react';
import R from 'ramda';
import ClosedComboBox from '../../../../../../components/common/ClosedComboBox';

let PropertySuggestion = ({ suggestion }) => {
  const [identity, prop] = suggestion.value.split('.');
  const type = suggestion.meta && (suggestion.meta.typeAlias || suggestion.meta.type);
  return (<div>
    <span>{prop}</span><span style={{ marginLeft: 12, fontSize: 12, color: '#00FF00' }}>({type}) </span>
    <div style={{ fontSize: 14, color: '#AAAAAA' }}>{identity}</div>
  </div>);
};

let getPropertyDisplayName = prop => prop === '' ? prop : prop.split('.')[1];

export default ({ mutate, property, suggestedValues }) => (<ClosedComboBox
  inputProps={{
    value: getPropertyDisplayName(property),
    onChange: (selectedOption) =>
      mutate.apply(m =>
        m.updateKey(selectedOption.value)
          .updateValue((selectedOption.meta && selectedOption.meta.defaultValue) || '')),
  }}
  renderSuggestion={ suggestion => (<PropertySuggestion suggestion={suggestion} />) }

  suggestions={R.uniqBy(x => x.value)([...suggestedValues]) }
  />);
