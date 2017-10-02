import React from 'react';
import PropTypes from 'prop-types';
import { compose, setDisplayName, setPropTypes, withStateHandlers } from 'recompose';
import ComboBox from '../../../../../components/common/ComboBox/ComboBox';
import { validKeyFormats, getManifestImplementationByFormat } from './../../utils/keyFormatHelpers';

const formatSuggestions = validKeyFormats.map(x => ({ label: x, value: x }));
const isValidFormat = format => validKeyFormats.includes(format);

const KeyFormatSelector = compose(
  setDisplayName('KeyFormatSelector'),
  setPropTypes({
    onFormatChanged: PropTypes.func.isRequired,
  }),
  withStateHandlers({ format: 'jpad' }, {
    updateFormat: (_, props) => (newFormat) => {
      if(isValidFormat(newFormat)) {
        const implementation = getManifestImplementationByFormat(newFormat);
        props.onFormatChanged(implementation);
      }
      return {
        format: newFormat,
      };
    },
  }),
)(({ format, updateFormat }) =>
  <div className="key-format-selector-container">
    <label className="key-format-label">Key format:</label>
    <div className="key-format-selector-wrapper" >
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
