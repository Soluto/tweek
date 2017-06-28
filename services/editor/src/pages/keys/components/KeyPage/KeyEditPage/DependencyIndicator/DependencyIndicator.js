import React from 'react';
import classNames from 'classnames';
import wrapComponentWithClass from '../../../../../../hoc/wrap-component-with-class';
import './DependencyIndicator.css';

const DependsOn = ({ dependencies }) =>
  dependencies && dependencies.length !== 0
    ? <div className={classNames('depends-on')} data-comp={'depends-on'}>
        Depends on:<br /><ul>{dependencies.map(dep => <li key={dep}>{dep}</li>)}</ul>
      </div>
    : <div />;

const UsedBy = ({ dependentKeys }) =>
  dependentKeys && dependentKeys.length !== 0
    ? <div className={classNames('depends-on')} data-comp={'depends-on'}>
        Used by:<br /><ul>{dependentKeys.map(dep => <li key={dep}>{dep}</li>)}</ul>
      </div>
    : <div />;

const DependencyIndicator = ({ manifest, dependentKeys }) =>
  <div className={classNames('dependency-indicator-container')}>
    <DependsOn {...manifest} />
    <UsedBy dependentKeys={dependentKeys} />
  </div>;

export default wrapComponentWithClass(DependencyIndicator);
