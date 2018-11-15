import React from 'react';
import { mapProps } from 'recompose';
import * as R from 'ramda';
import classnames from 'classnames';
import FixedKeysList from './FixedKeysList/FixedKeysList';
import { NewFixedKey } from './FixedKeysList/FixedKey/FixedKey';
import './FixedKeys.css';

const mapWithProp = prop =>
  R.pipe(R.toPairs, R.map(([keyPath, value]) => ({ keyPath, [prop]: value })));

function extractKeys(remote, local) {
  return R.pipe(
    R.mapObjIndexed((items, prop) => mapWithProp(prop)(items)),
    R.values,
    R.flatten,
    R.groupBy(R.prop('keyPath')),
    R.map(R.mergeAll),
    R.values,
  )({ remote, local });
}

const extractLocal = R.pipe(
  R.filter(({ local }) => local !== undefined),
  R.indexBy(R.prop('keyPath')),
  R.pluck('local'),
);

const FixedKeys = ({ className, appendKey, onChange, toggleDelete, keys }) => (
  <div className={classnames('fixed-keys-container', className)} data-comp="fixed-keys">
    <div className="override-keys-title">Override Keys</div>

    <FixedKeysList {...{ keys, onChange, toggleDelete }} />

    <NewFixedKey appendKey={appendKey} />
  </div>
);

const mapHandlersToProps = mapProps(({ local, remote, updateContext, ...props }) => {
  const formattedKeys = extractKeys(remote, local);
  return {
    keys: formattedKeys,
    ...props,
    onChange: (index, { keyPath, value: local }) => {
      const keys = R.adjust(R.merge(R.__, { keyPath, local }), index, formattedKeys);
      return updateContext(extractLocal(keys));
    },
    toggleDelete: (index) => {
      const keys = R.adjust(
        R.ifElse(R.has('local'), R.dissoc('local'), item => R.assoc('local', item.remote, item)),
        index,
        formattedKeys,
      );
      return updateContext(extractLocal(keys));
    },
    appendKey: ({ keyPath, value }) => updateContext(R.assoc(keyPath, value, local)),
  };
});

export default mapHandlersToProps(FixedKeys);
