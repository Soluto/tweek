import React from 'react';
import PropTypes from 'prop-types';
import { compose, setDisplayName, setPropTypes } from 'recompose';
import ValidationIcon from '../../../../../components/common/ValidationIcon';
import ComboBox from '../../../../../components/common/ComboBox/ComboBox';
import { formatSuggestions } from '../../../../../utils/keyFormatHelpers';

const KeyFormatSelector = compose(
  setDisplayName('KeyFormatSelector'),
  setPropTypes({
    onFormatChanged: PropTypes.func.isRequired,
    format: PropTypes.oneOf(['const', 'jpad', '']),
    validation: PropTypes.shape({
      isShowingHint: PropTypes.bool,
      hint: PropTypes.string,
    }).isRequired,
  }),
)(({ format, validation, onFormatChanged }) =>
  <div>
    <label className="key-format-label">Key format:</label>
    <ValidationIcon show={validation.isShowingHint} hint={validation.hint} />
    <ComboBox
      suggestions={formatSuggestions}
      value={format}
      placeholder="Select Key Format"
      onChange={(input, selected) => selected && onFormatChanged(selected.value)}
    />
  </div>,
);

export default KeyFormatSelector;
