import React from 'react';
import classNames from 'classnames';
import './DependencyIndicator.css';

const DependsOn = ({ dependencies }) =>
  <div
    className={classNames('depends-on', 'dependency-indicator-container')}
    data-comp={'depends-on'}
  >
    {Array.isArray(dependencies) && dependencies.length
      ? <div>Depends on:<br /><ul>{dependencies.map(dep => <li key={dep}>{dep}</li>)}</ul></div>
      : <div />}
  </div>;

const UsedBy = ({ dependentKeys }) =>
  <div className={classNames('used-by', 'dependency-indicator-container')} data-comp={'used-by'}>
    {Array.isArray(dependentKeys) && dependentKeys.length
      ? <div>Used by:<br /><ul>{dependentKeys.map(dep => <li key={dep}>{dep}</li>)}</ul></div>
      : <div />}
  </div>;

export { UsedBy, DependsOn };
