import classNames from 'classnames';
import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { KeyManifest } from 'tweek-client';
import { StoreState } from '../../../../../store/ducks/types';
import { getDataValueType } from './utils';

const enhance = connect((state: StoreState) => ({ keys: state.keys }));

export type KeyItemProps = {
  name: string;
  fullPath: string;
  depth: number;
  selected?: boolean;
  keys: Record<string, KeyManifest>;
};

const KeyItem = ({ name, fullPath, depth, selected, keys }: KeyItemProps) => (
  <div className="key-link-wrapper" data-comp="key-link">
    <Link
      title={fullPath}
      className={classNames('key-link', { selected })}
      style={{ paddingLeft: (depth + 1) * 10 }}
      to={`/keys/${fullPath}`}
    >
      <div
        className={classNames('key-type', 'key-icon')}
        data-value-type={getDataValueType(keys[fullPath])}
      />
      <span>{name}</span>
    </Link>
  </div>
);

export default enhance(KeyItem);
