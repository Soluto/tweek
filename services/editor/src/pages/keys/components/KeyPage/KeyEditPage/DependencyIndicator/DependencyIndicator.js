import React from 'react';
import { Link } from 'react-router-dom';
import AnimakitExpander from 'animakit-expander';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { withState } from 'recompose';
import './DependencyIndicator.css';

const ExpanderToggle = ({ toggled, onToggle, dataComp }) =>
  <span
    data-comp={dataComp}
    onClick={() => onToggle(current => !current)}
    style={{ cursor: 'pointer', fontFamily: 'monospaced', color: '#a5a5a5' }}
  >
    {toggled ? '[-]' : '[+]'}
  </span>;

export const DependsOn = withState(
  'toggled',
  'onToggle',
  false,
)(({ dependencies, toggled, onToggle }) =>
  <div
    className={classNames('depends-on', 'dependency-indicator-container')}
    data-comp={'depends-on'}
  >
    {dependencies.length
      ? <div>
          <ExpanderToggle
            dataComp="depends-on-toggle"
            toggled={toggled}
            onToggle={onToggle}
          />Depends on:<br />
          <AnimakitExpander expanded={toggled} align="bottom">
            <ul>
              {dependencies.map(dep => <li key={dep}><Link to={`/keys/${dep}`}>{dep}</Link></li>)}
            </ul>
          </AnimakitExpander>
        </div>
      : <div />}
  </div>,
);

export const UsedBy = withState(
  'toggled',
  'onToggle',
  false,
)(({ dependentKeys, toggled, onToggle }) =>
  <div className={classNames('used-by', 'dependency-indicator-container')} data-comp={'used-by'}>
    {dependentKeys.length
      ? <div>
          <ExpanderToggle dataComp="used-by-toggle" toggled={toggled} onToggle={onToggle} />Used by:<br />
          <AnimakitExpander expanded={toggled} align="bottom">
            <ul>
              {dependentKeys.map(dep => <li key={dep}><Link to={`/keys/${dep}`}>{dep}</Link></li>)}
            </ul>
          </AnimakitExpander>
        </div>
      : <div />}
  </div>,
);

DependsOn.propTypes = {
  dependencies: PropTypes.array.isRequired,
};

DependsOn.defaultProps = {
  dependencies: [],
};

UsedBy.propTypes = {
  dependentKeys: PropTypes.array.isRequired,
};

UsedBy.defaultProps = {
  dependentKeys: [],
};
