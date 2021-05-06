import React, { useState } from 'react';
import { KeyImplementation } from 'tweek-client';
import { ComboBox } from '../../../../../components/common';
import { getManifestImplementationByFormat, validKeyFormats } from '../../utils/keyFormatHelpers';

const formatSuggestions = validKeyFormats.map((x) => ({ label: x, value: x }));
const isValidFormat = (format: string) => validKeyFormats.includes(format);

export type KeyFormatSelectorProps = {
  onFormatChanged: (f: KeyImplementation) => void;
};

const KeyFormatSelector = ({ onFormatChanged }: KeyFormatSelectorProps) => {
  const [format, setFormat] = useState('jpad');

  const updateFormat = (newFormat: string) => {
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

export default KeyFormatSelector;
