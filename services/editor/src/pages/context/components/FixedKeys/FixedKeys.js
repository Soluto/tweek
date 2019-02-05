import React from 'react';
import * as R from 'ramda';
import classnames from 'classnames';
import FixedKeysList from './FixedKeysList/FixedKeysList';
import { NewFixedKey } from './FixedKeysList/FixedKey/FixedKey';
import './FixedKeys.css';

const mapWithProp = (prop) =>
  R.pipe(
    R.toPairs,
    R.map(([keyPath, value]) => ({ keyPath, [prop]: value })),
  );

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

export default class FixedKeys extends React.Component {
  static getDerivedStateFromProps({ local, remote }) {
    const formattedKeys = extractKeys(remote, local);
    return { formattedKeys };
  }

  state = { formattedKeys: undefined };

  onChange = (index, { keyPath, value: local }) => {
    const { updateContext } = this.props;
    const { formattedKeys } = this.state;
    const keys = R.adjust(index, R.mergeLeft({ keyPath, local }), formattedKeys);
    return updateContext(extractLocal(keys));
  };

  toggleDelete = (index) => {
    const { updateContext } = this.props;
    const { formattedKeys } = this.state;

    const keys = R.adjust(
      index,
      R.ifElse(R.has('local'), R.dissoc('local'), (item) => R.assoc('local', item.remote, item)),
      formattedKeys,
    );
    return updateContext(extractLocal(keys));
  };

  appendKey = ({ keyPath, value }) => {
    const { updateContext, local } = this.props;
    updateContext(R.assoc(keyPath, value, local));
  };

  render() {
    const { className } = this.props;
    const { formattedKeys } = this.state;

    return (
      <div className={classnames('fixed-keys-container', className)} data-comp="fixed-keys">
        <div className="override-keys-title">Override Keys</div>

        <FixedKeysList
          keys={formattedKeys}
          onChange={this.onChange}
          toggleDelete={this.toggleDelete}
        />

        <NewFixedKey appendKey={this.appendKey} />
      </div>
    );
  }
}
