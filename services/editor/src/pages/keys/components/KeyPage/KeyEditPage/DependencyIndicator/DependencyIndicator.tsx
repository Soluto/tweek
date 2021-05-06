import { faMinusSquare, faPlusSquare } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { Dispatch, FunctionComponent, ReactElement, SetStateAction, useState } from 'react';
import { Collapse } from 'react-collapse';
import { Link } from 'react-router-dom';
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

const renderLink = (dep: string) => <Link to={`/keys/${dep}`}>{dep}</Link>;

export type RenderTextProps = {
  deleteAlias: (dep: string) => void;
};

const renderText = (dep: string, { deleteAlias }: RenderTextProps) => (
  <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
    <span style={{ marginRight: 5 }}>{dep}</span>
    <button data-comp="delete-alias" onClick={() => deleteAlias(dep)}>
      <img src={trashIcon} alt={''} />
    </button>
  </div>
);

export type DependencyListProps = {
  items?: string[];
};

const createDependenciesList = <T,>(
  componentName: string,
  title: string,
  renderElement: (dep: string, props: T) => ReactElement,
): FunctionComponent<DependencyListProps & T> => ({ items, ...props }) => (
  <div className="dependency-indicator-container" data-comp={componentName} data-loaded={!!items}>
    {items?.length ? (
      <Expander title={title}>
        <ul>
          {items.map((dep) => (
            <li key={dep} className="dependency-item" data-dependency={dep}>
              {renderElement(dep, props as T)}
            </li>
          ))}
        </ul>
      </Expander>
    ) : null}
  </div>
);

export const DependsOn = createDependenciesList('depends-on', 'Depends on:', renderLink);

export const UsedBy = createDependenciesList('used-by', 'Used by:', renderLink);

export const Aliases = createDependenciesList('aliases', 'Aliases:', renderText);
