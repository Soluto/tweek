import React from 'react';
import classNames from 'classnames';
import wrapComponentWithClass from '../../../../../../hoc/wrap-component-with-class';

const DependsOn = ({ dependencies }) =>
  dependencies && dependencies.length !== 0
    ? <div>depends on: {dependencies.map(dep => <div>{dep}</div>)}</div>
    : <div />;

const UsedBy = ({ dependentKeys }) =>
  dependentKeys && dependentKeys.length !== 0
    ? <div>used by: <ul>{dependentKeys.map(dep => <li key={dep}>{dep}</li>)}</ul></div>
    : <div />;

const DependencyIndicator = ({ manifest, dependentKeys }) =>
  <div>
    <DependsOn {...manifest} />
    <UsedBy dependentKeys={dependentKeys} />
  </div>;

export default wrapComponentWithClass(DependencyIndicator);
