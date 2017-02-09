import React from 'react';
import ComboBox from '../../../../../../components/common/ComboBox/ComboBox';
import style from './KeyValueTypeSelector.css';
import { types } from '../../../../../../services/TypesService';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { updateKeyValueType } from '../../../../../../store/ducks/selectedKey';
import ReactTooltip from 'react-tooltip';
import alertIconSrc from '../resources/alert-icon.svg';

const capitalizeFirstLetter = (string) => string.charAt(0).toUpperCase() + string.slice(1);
const getValueTypeSuggestions = () => {
  return Object.keys(types)
    .map(x => types[x])
    .map(x => !!x.typeAlias ? x.typeAlias : x.type)
    .map(x => ({
      label: capitalizeFirstLetter(x),
      value: x,
    }));
};

const KeyValueTypeSelector = compose(
  connect(state => ({
    selectedKey: state.selectedKey,
    validation: state.selectedKey.validation.meta.valueType,
  }), { updateKeyValueType })
)(props => {
  const suggestions = getValueTypeSuggestions();
  return (
    <div className={style['key-value-type-selector-container']}>
      <label className={style['key-value-type-label']}>Key value type:</label>
      <div className={style['key-value-type-selector-wrapper']}
        data-with-error={props.validation.isShowingHint}>
        <div className={style['validation-icon-wrapper']}
          data-is-shown={props.validation.isShowingHint}>
          <img data-tip={props.validation.hint}
            className={style['validation-icon']}
            src={alertIconSrc} />
        </div>
        <ComboBox
          options={suggestions}
          placeholder="Select type"
          showValueInOptions={false}
          onChange={item => props.updateKeyValueType(item.value)}
        />
        <ReactTooltip
          disable={!props.validation.isShowingHint}
          effect="solid"
          place="top"
          delayHide={500} />
      </div>
    </div>
  );
});

export default KeyValueTypeSelector;