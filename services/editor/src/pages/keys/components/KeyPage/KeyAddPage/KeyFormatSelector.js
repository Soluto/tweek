import React from 'react';
import PropTypes from 'prop-types';
import { compose, setDisplayName, withState, setPropTypes } from 'recompose';
import ValidationIcon from '../../../../../components/common/ValidationIcon';
import ComboBox from '../../../../../components/common/ComboBox/ComboBox';
import { validKeyFormats, formatSuggestions } from '../../../../../utils/keyFormatHelpers';

const hint = `Only the following values are allowed: ${validKeyFormats.join(', ')}`;

const KeyFormatSelector = compose(
  setDisplayName('KeyFormatSelector'),
  setPropTypes({
    onFormatChanged: PropTypes.func.isRequired,
  }),
  withState('format', 'updateFormat', ''),
)(({ format, updateFormat, onFormatChanged }) => {
  const showHint = format.length !== 0 && !validKeyFormats.includes(format);
  return (
    <div>
      <label className="key-value-type-label">Key format:</label>
      <ValidationIcon show={showHint} hint={hint} />
      <ComboBox
        suggestions={formatSuggestions}
        value={format}
        placeholder="Select Key Format"
        onChange={(text) => {
          onFormatChanged(text);
          updateFormat(text);
        }}
        showValueInOptions
      />
    </div>
  );
});

export default KeyFormatSelector;
