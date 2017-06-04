import React from 'react';
import PropTypes from 'prop-types';
import './SaveButton.css';

const SaveButton = ({ isSaving, hasChanges, ...props }) =>
  <button
    disabled={!hasChanges || isSaving}
    data-state-has-changes={hasChanges}
    data-state-is-saving={isSaving}
    {...props}
  >
    {isSaving ? 'Saving...' : 'Save changes'}
  </button>;

SaveButton.propTypes = {
  isSaving: PropTypes.bool,
  hasChanges: PropTypes.bool,
  className: PropTypes.string,
};

SaveButton.defaultProps = {
  isSaving: false,
  hasChanges: true,
  className: 'save-button',
};

export default SaveButton;
