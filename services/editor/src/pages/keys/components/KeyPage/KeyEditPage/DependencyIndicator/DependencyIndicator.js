import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import './DependencyIndicator.css';

export const DependsOn = ({ dependencies }) =>
  <div
    className={classNames('depends-on', 'dependency-indicator-container')}
    data-comp={'depends-on'}
  >
    {dependencies.length
      ? <div>
          Depends on:<br />
          <ul>{dependencies.map(dep => <li key={dep}><a href={`/keys/${dep}`}>{dep}</a></li>)}</ul>
        </div>
      : <div />}
  </div>;

export const UsedBy = ({ dependentKeys }) =>
  <div className={classNames('used-by', 'dependency-indicator-container')} data-comp={'used-by'}>
    {dependentKeys.length
      ? <div>
          Used by:<br />
          <ul>{dependentKeys.map(dep => <li key={dep}><a href={`/keys/${dep}`}>{dep}</a></li>)}</ul>
        </div>
      : <div />}
  </div>;

DependsOn.propTypes = {
  dependencies: PropTypes.array.isRequired,
};

DependsOn.defaultProps = {
  dependencies: PropTypes.array.isRequired,
};

UsedBy.propTypes = {
  dependentKeys: [],
};

UsedBy.defaultProps = {
  dependentKeys: [],
};
