import React from 'react';
import { Link } from 'react-router-dom';
import AnimakitExpander from 'animakit-expander';
import { withState } from 'recompose';
import trashIcon from '../../../../../../resources/trash-icon.svg';
import './DependencyIndicator.css';

const ExpanderToggle = ({ toggled, onToggle }) => (
  <span
    data-comp="expander-toggle"
    onClick={() => onToggle(current => !current)}
    style={{ cursor: 'pointer', fontFamily: 'monospaced', color: '#a5a5a5' }}
  >
    {toggled ? '[-]' : '[+]'}
  </span>
);

const withToggleState = withState('toggled', 'onToggle', false);

const Expander = withToggleState(({ title, toggled, onToggle, children, ...props }) => (
  <div {...props}>
    <ExpanderToggle toggled={toggled} onToggle={onToggle} />
    {title}
    <br />
    <AnimakitExpander expanded={toggled} align="bottom">
      {children}
    </AnimakitExpander>
  </div>
));

const renderLink = dep => <Link to={`/keys/${dep}`}>{dep}</Link>;
const renderText = (dep, { deleteAlias }) => (
  <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
    <span style={{ marginRight: 5 }}>{dep}</span>
    <button data-comp="delete-alias" onClick={() => deleteAlias(dep)}>
      <img src={trashIcon} alt={''} />
    </button>
  </div>
);

const createDependenciesList = (componentName, title, renderElement) => ({ items, ...props }) => (
  <div className="dependency-indicator-container" data-comp={componentName} data-loaded={!!items}>
    {items && items.length ? (
      <Expander title={title}>
        <ul>
          {items.map(dep => (
            <li key={dep} className="dependency-item" data-dependency={dep}>
              {renderElement(dep, props)}
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
