import classNames from 'classnames';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { useKeysContext } from '../../../../../contexts/AllKeys';
import { getDataValueType } from './utils';

export type KeyItemProps = {
  name: string;
  fullPath: string;
  depth: number;
  selected?: boolean;
};

const KeyItem = ({ name, fullPath, depth, selected }: KeyItemProps) => {
  const keys$ = useKeysContext();
  const [valueType, setValueType] = useState(getDataValueType(keys$.value[fullPath]));

  useEffect(() => {
    const subscription = keys$
      .pipe(
        map((keys) => getDataValueType(keys[fullPath])),
        distinctUntilChanged(),
      )
      .subscribe(setValueType);

    return () => subscription.unsubscribe();
  }, [keys$, fullPath]);

  return (
    <div className="key-link-wrapper" data-comp="key-link">
      <Link
        title={fullPath}
        className={classNames('key-link', { selected })}
        style={{ paddingLeft: (depth + 1) * 10 }}
        to={`/keys/${fullPath}`}
      >
        <div className={classNames('key-type', 'key-icon')} data-value-type={valueType} />
        <span>{name}</span>
      </Link>
    </div>
  );
};

export default KeyItem;
