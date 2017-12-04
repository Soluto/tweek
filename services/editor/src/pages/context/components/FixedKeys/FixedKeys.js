import React from 'react';
import { connect } from 'react-redux';
import { compose, mapProps } from 'recompose';
import * as R from 'ramda';
import classnames from 'classnames';
import * as contextActions from '../../../../store/ducks/context';
import { getFixedKeys, FIXED_PREFIX } from '../../../../services/context-service';
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

const getProperties = R.pickBy((_, prop) => !prop.startsWith(FIXED_PREFIX));

const extractLocal = R.pipe(
  R.filter(({ local }) => local !== undefined),
  R.indexBy(({ keyPath }) => FIXED_PREFIX + keyPath),
  R.map(R.prop('local')),
);

const FixedKeys = ({ className, appendKey, onChange, toggleDelete, keys }) => (
  <div className={classnames('fixed-keys-container', className)} data-comp="fixed-keys">
    <div className="override-keys-title">Override Keys</div>

    <FixedKeysList {...{ keys, onChange, toggleDelete }} />

    <NewFixedKey appendKey={appendKey} />
  </div>
);

export default compose(
  connect(state => state.context, contextActions),
  mapProps(({ local, remote, updateContext, ...props }) => {
    const localFixedKeys = getFixedKeys(local);
    const remoteFixedKeys = getFixedKeys(remote);
    const formattedKeys = extractKeys(remoteFixedKeys, localFixedKeys);
    const extractObj = keys => ({ ...getProperties(remote), ...extractLocal(keys) });
    return {
      onChange: (index, { keyPath, value: local }) => {
        const keys = R.adjust(R.merge(R.__, { keyPath, local }), index, formattedKeys);
        return updateContext(extractObj(keys));
      },
      toggleDelete: (index) => {
        const keys = R.adjust(
          R.ifElse(R.has('local'), R.dissoc('local'), item => R.assoc('local', item.remote, item)),
          index,
          formattedKeys,
        );
        return updateContext(extractObj(keys));
      },
      keys: formattedKeys,
      appendKey: ({ keyPath, value }) =>
        updateContext(R.assoc(FIXED_PREFIX + keyPath, value, local)),
      ...props,
    };
  }),
)(FixedKeys);
