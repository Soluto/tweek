import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { ComboBox } from '../../../../../components/common';
import { getManifestImplementationByFormat, validKeyFormats } from '../../utils/keyFormatHelpers';

const formatSuggestions = validKeyFormats.map((x) => ({ label: x, value: x }));
const isValidFormat = (format) => validKeyFormats.includes(format);

const KeyFormatSelector = ({ onFormatChanged }) => {
  const [format, setFormat] = useState('jpad');

  const updateFormat = (newFormat) => {
    if (isValidFormat(newFormat)) {
      const implementation = getManifestImplementationByFormat(newFormat);
      onFormatChanged(implementation);
    }
    setFormat(newFormat);
  };

  return (
    <div className="key-format-selector-container">
      <label className="key-format-label">Key format:</label>
      <div className="key-format-selector-wrapper">
        <ComboBox
          data-comp="key-format-selector"
          suggestions={formatSuggestions}
          value={format}
          placeholder="Select Key Format"
          onChange={(input, selected) => selected && updateFormat(selected.value)}
        />
      </div>
    </div>
  );
};

KeyFormatSelector.propTypes = {
  onFormatChanged: PropTypes.func.isRequired,
};

export default KeyFormatSelector;
