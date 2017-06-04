import React from 'react';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import ReactTooltip from 'react-tooltip';
import changeCase from 'change-case';
import ComboBox from '../../../../../../components/common/ComboBox/ComboBox';
import * as TypesServices from '../../../../../../services/types-service';
import { updateKeyValueType } from '../../../../../../store/ducks/selectedKey';
import alertIconSrc from '../resources/alert-icon.svg';
import './KeyValueTypeSelector.css';

const getValueTypeSuggestions = () =>
  Object.keys(TypesServices.types).map(x => ({
    label: changeCase.titleCase(x),
    value: x,
  }));

const KeyValueTypeSelector = compose(
  connect(
    state => ({
      selectedKey: state.selectedKey,
      validation: state.selectedKey.validation.manifest.valueType,
    }),
    { updateKeyValueType },
  ),
)(({ value, validation: { isShowingHint, hint }, updateKeyValueType: onChange }) => {
  const suggestions = getValueTypeSuggestions();
  return (
    <div className={'key-value-type-selector-container'}>
      <label className={'key-value-type-label'}>Key value type:</label>
      <div className={'key-value-type-selector-wrapper'} data-with-error={isShowingHint}>
        <div className={'validation-icon-wrapper'} data-is-shown={isShowingHint}>
          <img data-tip={hint} className={'validation-icon'} src={alertIconSrc} />
        </div>
        <ComboBox
          suggestions={suggestions}
          placeholder="Select type"
          onChange={(_, item) => item && onChange(item.value)}
          value={changeCase.titleCase(value)}
        />
        <ReactTooltip disable={!isShowingHint} effect="solid" place="top" delayHide={500} />
      </div>
    </div>
  );
});

export default KeyValueTypeSelector;
