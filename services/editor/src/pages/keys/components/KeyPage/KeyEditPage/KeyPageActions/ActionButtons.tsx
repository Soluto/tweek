import React, { ComponentProps } from 'react';
import archiveIcon from '../../../../../../resources/archive-icon.svg';
import linkIcon from '../../../../../../resources/link-icon.svg';
import restoreIcon from '../../../../../../resources/restore-icon.svg';
import trashIcon from '../../../../../../resources/trash-icon.svg';

type IconButtonConfig = {
  image: string;
  text: string;
  dataComp: string;
};

const iconButton = ({ image, text, dataComp }: IconButtonConfig) => (
  props: ComponentProps<'button'>,
) => (
  <button data-comp={dataComp} className="icon-button" tabIndex={-1} {...props}>
    <img src={image} title={text} alt={text} />
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
