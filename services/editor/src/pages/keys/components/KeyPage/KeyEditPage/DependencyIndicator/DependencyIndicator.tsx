import { faMinusSquare, faPlusSquare } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { ComponentType, Dispatch, FunctionComponent, SetStateAction, useState } from 'react';
import { Collapse } from 'react-collapse';
import { Link } from 'react-router-dom';
import { useDeleteAlias } from '../../../../../../contexts/SelectedKey/useKeyActions';
import trashIcon from '../../../../../../resources/trash-icon.svg';
import './DependencyIndicator.css';

type ExpanderToggleProps = {
  toggled: boolean;
  onToggle: Dispatch<SetStateAction<boolean>>;
};

const ExpanderToggle = ({ toggled, onToggle }: ExpanderToggleProps) => (
  <span
    data-comp="expander-toggle"
    onClick={() => onToggle((current) => !current)}
    style={{ cursor: 'pointer', color: '#a5a5a5', marginRight: '0.3em' }}
  >
    <FontAwesomeIcon icon={toggled ? faMinusSquare : faPlusSquare} />
  </span>
);

export type ExpanderProps = {
  title: string;
};

const Expander: FunctionComponent<ExpanderProps> = ({ title, children, ...props }) => {
  const [toggled, onToggle] = useState(false);

  return (
    <div {...props}>
      <p>
        <ExpanderToggle toggled={toggled} onToggle={onToggle} />
        {title}
      </p>
      <Collapse isOpened={toggled}>{children}</Collapse>
    </div>
  );
};

type DependencyProps = {
  dependency: string;
};

const KeyDependency = ({ dependency }: DependencyProps) => (
  <Link to={`/keys/${dependency}`}>{dependency}</Link>
);

const AliasDependency = ({ dependency }: DependencyProps) => {
  const deleteAlias = useDeleteAlias();

  return (
    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
      <span style={{ marginRight: 5 }}>{dependency}</span>
      <button data-comp="delete-alias" onClick={() => deleteAlias(dependency)}>
        <img src={trashIcon} alt={''} />
      </button>
    </div>
  );
};

export type DependencyListProps = {
  items?: string[];
};

const createDependenciesList = (
  componentName: string,
  title: string,
  Component: ComponentType<DependencyProps>,
): FunctionComponent<DependencyListProps> => ({ items }) => (
  <div className="dependency-indicator-container" data-comp={componentName} data-loaded={!!items}>
    {items?.length ? (
      <Expander title={title}>
        <ul>
          {items.map((dep) => (
            <li key={dep} className="dependency-item" data-dependency={dep}>
              <Component dependency={dep} />
            </li>
          ))}
        </ul>
      </Expander>
    ) : null}
  </div>
);

export const DependsOn = createDependenciesList('depends-on', 'Depends on:', KeyDependency);

export const UsedBy = createDependenciesList('used-by', 'Used by:', KeyDependency);

export const Aliases = createDependenciesList('aliases', 'Aliases:', AliasDependency);
