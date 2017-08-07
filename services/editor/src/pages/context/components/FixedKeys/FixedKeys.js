import React from 'react';
import { connect } from 'react-redux';
import { compose, mapProps } from 'recompose';
import R from 'ramda';
import classnames from 'classnames';
import deepEqual from 'deep-equal';
import * as contextActions from '../../../../store/ducks/context';
import { getFixedKeys, FIXED_PREFIX } from '../../../../services/context-service';
import SaveButton from '../../../../components/common/SaveButton/SaveButton';
import FixedKeysList from './FixedKeysList/FixedKeysList';
import { NewFixedKey } from './FixedKeysList/FixedKey/FixedKey';
import './FixedKeys.css';

const mapWithProp = prop =>
  R.pipe(Object.entries, R.map(([keyPath, value]) => ({ keyPath, [prop]: value })));

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

const hasValues = R.pipe(Object.entries, R.all(R.all(x => x !== undefined && x !== '')));

const FixedKeys = ({
  className,
  isSavingContext,
  appendKey,
  hasChanges,
  saveContext,
  onChange,
  toggleDelete,
  keys,
}) =>
  <div className={classnames('fixed-keys-container', className)} data-comp="fixed-keys">
    <div className={'override-keys-title'}>
      <div>Override Keys</div>
      <SaveButton onClick={saveContext} hasChanges={hasChanges} isSaving={isSavingContext} />
    </div>

    <FixedKeysList {...{ keys, onChange, toggleDelete }} />

    <NewFixedKey appendKey={appendKey} />
  </div>;

export default compose(
  connect(state => state.context, contextActions),
  mapProps(({ identityName, identityId, local, remote, saveContext, updateContext, ...props }) => {
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
        updateContext({ ...local, [FIXED_PREFIX + keyPath]: value }),
      hasChanges: hasValues(localFixedKeys) && !deepEqual(remoteFixedKeys, localFixedKeys),
      saveContext: () => saveContext({ identityName, identityId }),
      ...props,
    };
  }),
)(FixedKeys);
