import React, { ComponentProps } from 'react';
import PropTypes from 'prop-types';
import './SaveButton.css';

export type SaveButtonProps = ComponentProps<'button'> & {
  isSaving: boolean;
  hasChanges?: boolean;
  isValid?: boolean;
};

const SaveButton = ({ isSaving, hasChanges, isValid, ...props }: SaveButtonProps) => (
  <button
    disabled={!hasChanges || !isValid || isSaving}
    data-state-has-changes={hasChanges}
    data-state-is-valid={isValid}
    data-state-is-saving={isSaving}
    {...props}
  >
    {isSaving ? 'Saving...' : 'Save changes'}
  </button>
);

SaveButton.propTypes = {
  isSaving: PropTypes.bool,
  hasChanges: PropTypes.bool,
  isValid: PropTypes.bool,
  className: PropTypes.string,
};

SaveButton.defaultProps = {
  isSaving: false,
  isValid: true,
  hasChanges: true,
  className: 'save-button',
};

export default SaveButton;
