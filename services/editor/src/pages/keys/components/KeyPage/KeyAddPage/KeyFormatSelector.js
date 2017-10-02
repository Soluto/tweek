import React from 'react';
import PropTypes from 'prop-types';
import { compose, setDisplayName, setPropTypes, withStateHandlers } from 'recompose';
import ValidationIcon from '../../../../../components/common/ValidationIcon';
import ComboBox from '../../../../../components/common/ComboBox/ComboBox';
import { formatSuggestions, isValidFormat, getFormatValidations, getManifestImplementationByFormat } from './../../utils/keyFormatHelpers';

const KeyFormatSelector = compose(
  setDisplayName('KeyFormatSelector'),
  setPropTypes({
    onFormatChanged: PropTypes.func.isRequired,
  }),
  withStateHandlers({ format: 'jpad', validation: { isValid: true, hint: '' } }, {
    updateFormat: (_, props) => (newFormat) => {
      const validation = getFormatValidations(newFormat);
      if(isValidFormat(newFormat)) {
        const implementation = getManifestImplementationByFormat(newFormat);
        props.onFormatChanged({ implementation });
      }
      return {
        format: newFormat,
        validation,
      };
    },
  }),
)(({ format, validation, updateFormat }) =>
  <div className="key-format-selector-container">
    <label className="key-format-label">Key format:</label>
    <div className="key-format-selector-wrapper" data-with-error={!validation.isValid}>
      <ValidationIcon show={!validation.isValid} hint={validation.hint} />
      <ComboBox
        data-comp="key-format-selector"
        suggestions={formatSuggestions}
        value={format}
        placeholder="Select Key Format"
        onChange={(input, selected) => selected && updateFormat(selected.value)}
      />
    </div>
  </div>,
);

export default KeyFormatSelector;
