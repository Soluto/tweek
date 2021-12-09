import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router-dom';
import { KeyManifest } from 'tweek-client';
import { getTagLink } from '../../utils/search';
import { getDataValueType } from './TreeView/utils';

type CardItemProps = KeyManifest & {
  selected?: boolean;
};

const CardItem = ({
  key_path,
  meta: { name, tags, description },
  valueType,
  selected,
}: CardItemProps) => (
  <div className={classNames('key-card', { selected })} data-comp="key-card">
    <Link title={key_path} className="key-link" to={`/keys/${key_path}`}>
      <div>
        <div className={classNames('key-type', 'card-icon')} data-value-type={valueType} />
        <div className="title">{name || key_path}</div>
        <div>
          {tags?.map((x) => (
            <Link className="tag" to={getTagLink(x)}>
              {x}
            </Link>
          ))}
        </div>
      </div>
      <div className="path">{key_path}</div>
      <div className="description">{description}</div>
    </Link>
  </div>
);

export type CardViewProps = {
  items: KeyManifest[];
  selectedItem?: string;
};

const CardView = ({ items, selectedItem }: CardViewProps) => (
  <div className="card-results">
    {items.map((item) => (
      <CardItem
        selected={item.key_path === selectedItem}
        {...item}
        valueType={getDataValueType(item)}
      />
    ))}
  </div>
);

CardView.propTypes = {
  items: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default CardView;
