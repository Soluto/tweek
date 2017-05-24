import React from 'react';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import ReactTooltip from 'react-tooltip';
import changeCase from 'change-case';
import ComboBox from '../../../../../../components/common/ComboBox/NewComboBox';
import * as TypesServices from '../../../../../../services/types-service';
import { updateKeyValueType } from '../../../../../../store/ducks/selectedKey';
import style from './KeyValueTypeSelector.css';
import alertIconSrc from '../resources/alert-icon.svg';

const getValueTypeSuggestions = () => Object.keys(TypesServices.types)
    .map(x => ({
      label: changeCase.titleCase(x),
      value: x,
    }));

const KeyValueTypeSelector = compose(
  connect(state => ({
    selectedKey: state.selectedKey,
    validation: state.selectedKey.validation.meta.valueType,
  }), { updateKeyValueType }),
)((props) => {
  const suggestions = getValueTypeSuggestions();
  return (
    <div className={style['key-value-type-selector-container']}>
      <label className={style['key-value-type-label']}>Key value type:</label>
      <div
        className={style['key-value-type-selector-wrapper']}
        data-with-error={props.validation.isShowingHint}
      >
        <div
          className={style['validation-icon-wrapper']}
          data-is-shown={props.validation.isShowingHint}
        >
          <img
            data-tip={props.validation.hint}
            className={style['validation-icon']}
            src={alertIconSrc}
          />
        </div>
        <ComboBox
          suggestions={suggestions}
          placeholder="Select type"
          onChange={(_, item) => item && props.updateKeyValueType(item.value)}
          selected={props.value}
        />
        <ReactTooltip
          disable={!props.validation.isShowingHint}
          effect="solid"
          place="top"
          delayHide={500}
        />
      </div>
    </div>
  );
});

export default KeyValueTypeSelector;
