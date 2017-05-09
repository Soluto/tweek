import React, { PropTypes } from 'react';
import style from './SaveButton.css';

const SaveButton = ({ isSaving, hasChanges, ...props }) => (
  <button
    disabled={!hasChanges || isSaving}
    data-state-has-changes={hasChanges}
    data-state-is-saving={isSaving}
    {...props}
  >
    {isSaving ? 'Saving...' : 'Save changes'}
  </button>
);

SaveButton.propTypes = {
  isSaving: PropTypes.bool,
  hasChanges: PropTypes.bool,
  className: PropTypes.string,
};

SaveButton.defaultProps = {
  isSaving: false,
  hasChanges: false,
  className: style['save-button'],
};

export default SaveButton;
