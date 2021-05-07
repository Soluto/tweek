import React, { ReactElement, useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import ReactTooltip from 'react-tooltip';
// @ts-ignore
import { VelocityTransitionGroup } from 'velocity-react';
import { BLANK_KEY_NAME } from '../../../../../store/ducks/ducks-utils/blankKeyDefinition';
import closedFolderIconSrc from '../resources/Folder-icon-closed.svg';
import openedFolderIconSrc from '../resources/Folder-icon-opened.svg';

export type TreeDirectoryProps = {
  fullPath: string;
  name: string;
  depth: number;
  children: ReactElement[];
  descendantsCount: number;
  selected: boolean;
  expandByDefault: boolean;
};

const TreeDirectory = ({
  fullPath,
  name,
  depth,
  children,
  descendantsCount,
  selected,
  expandByDefault,
}: TreeDirectoryProps) => {
  const [isCollapsed, setIsCollapsed] = useState(!selected && !expandByDefault);
  const history = useHistory();

  useEffect(() => {
    if (selected) {
      setIsCollapsed(false);
    }
  }, [selected]);

  useEffect(() => {
    if (!selected) {
      setIsCollapsed(!expandByDefault);
    }
  }, [expandByDefault]); //eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="key-folder">
      <div
        style={{ paddingLeft: (depth + 1) * 10 }}
        className="key-folder-name"
        onClick={() => setIsCollapsed((c) => !c)}
        data-folder-name={fullPath}
        data-is-collapsed={isCollapsed}
      >
        <img
          className="key-folder-icon"
          src={isCollapsed ? closedFolderIconSrc : openedFolderIconSrc}
          alt={''}
        />
        {name}
        <label className="number-of-folder-keys">{descendantsCount}</label>
        <button
          data-comp="add"
          className="add-key"
          data-tip={'Add key in folder'}
          data-for={fullPath}
          data-delay-hide={100}
          data-delay-show={500}
          data-effect="solid"
          data-place="top"
          onClick={(event) => {
            event.stopPropagation();
            const params = new URLSearchParams();
            params.set('hint', `${fullPath}/`);
            history.push({ pathname: `/keys/${BLANK_KEY_NAME}`, search: params.toString() });
          }}
        />
        <ReactTooltip id={fullPath} />
      </div>

      <VelocityTransitionGroup enter={{ animation: 'slideDown' }} leave={{ animation: 'slideUp' }}>
        {isCollapsed ? undefined : (
          <ul className="folder-items">
            {children.map((child, i) => (
              <li className="sub-tree" key={i}>
                {child}
              </li>
            ))}
          </ul>
        )}
      </VelocityTransitionGroup>
    </div>
  );
};

export default TreeDirectory;
