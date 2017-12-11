import React from 'react';
import { Link } from 'react-router-dom';
import AnimakitExpander from 'animakit-expander';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { withState, setPropTypes, compose } from 'recompose';
import './DependencyIndicator.css';

const ExpanderToggle = ({ toggled, onToggle, dataComp }) => (
  <span
    data-comp={dataComp}
    onClick={() => onToggle(current => !current)}
    style={{ cursor: 'pointer', fontFamily: 'monospaced', color: '#a5a5a5' }}
  >
    {toggled ? '[-]' : '[+]'}
  </span>
);

const createDependenciesList = (componentName, caption, readonly) =>
  compose(withState('toggled', 'onToggle', false), setPropTypes({ items: PropTypes.array }))(
    ({ items, toggled, onToggle }) => (
      <div
        className={classNames(componentName, 'dependency-indicator-container')}
        data-comp={componentName}
        data-loaded={!!items}
      >
        {items && items.length ? (
          <div>
            <ExpanderToggle
              dataComp={`${componentName}-toggle`}
              toggled={toggled}
              onToggle={onToggle}
            />
            {caption}
            <br />
            <AnimakitExpander expanded={toggled} align="bottom">
              <ul>
                {items.map(dep => (
                  <li key={dep} className="dependency-item" data-dependency={dep}>
                    {readonly ? dep : <Link to={`/keys/${dep}`}>{dep}</Link>}
                  </li>
                ))}
              </ul>
            </AnimakitExpander>
          </div>
        ) : (
          <div />
        )}
      </div>
    ),
  );

export const DependsOn = createDependenciesList('depends-on', 'Depends on:');

export const UsedBy = createDependenciesList('used-by', 'Used by:');

export const Aliases = createDependenciesList('aliases', 'Aliases:', true);
