import React from 'react';
import PropTypes from 'prop-types';

export default function CardView({ items, renderItem, expandByDefault }) {
  let Card = renderItem;
  return (
    <div class="key-search" data-comp="keys-search-view">
      {items.map(item => <Card {...item} />)}
    </div>
  );
}

CardView.propTypes = {
  items: PropTypes.arrayOf(PropTypes.string).isRequired,
  renderItem: PropTypes.func.isRequired,
};
