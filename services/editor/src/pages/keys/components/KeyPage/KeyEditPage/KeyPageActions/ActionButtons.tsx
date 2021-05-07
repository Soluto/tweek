import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faUndo } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { ComponentProps } from 'react';
import archiveIcon from '../../../../../../resources/archive-icon.svg';
import linkIcon from '../../../../../../resources/link-icon.svg';
import restoreIcon from '../../../../../../resources/restore-icon.svg';
import trashIcon from '../../../../../../resources/trash-icon.svg';

type IconButtonConfig = {
  image?: string;
  icon?: IconProp;
  text: string;
  dataComp: string;
};

const iconButton = ({ image, text, dataComp, icon }: IconButtonConfig) => (
  props: ComponentProps<'button'>,
) => (
  <button data-comp={dataComp} className="icon-button" tabIndex={-1} {...props}>
    {image && <img src={image} title={text} alt={text} />}
    {icon && <FontAwesomeIcon icon={icon} title={text} />}
  </button>
);

export const DeleteButton = iconButton({
  image: trashIcon,
  text: 'Delete key',
  dataComp: 'delete-key',
});

export const ArchiveButton = iconButton({
  image: archiveIcon,
  text: 'Archive key',
  dataComp: 'archive-key',
});

export const UnarchiveButton = iconButton({
  image: restoreIcon,
  text: 'Restore key',
  dataComp: 'unarchive-key',
});

export const AddAliasButton = iconButton({
  image: linkIcon,
  text: 'Add Alias',
  dataComp: 'add-alias',
});

export const ResetButton = iconButton({
  icon: faUndo,
  text: 'Reset changes',
  dataComp: 'reset-key',
});
