import React from 'react';
import { pure } from 'recompose';
import PropTypes from 'prop-types';

export default function CardView({ items, renderItem, selectedItem, itemSelector = (x) => x }) {
  let Card = pure(renderItem);
  return (
    <div className="card-results">
      {items.map((item) => (
        <Card selected={itemSelector(item) === selectedItem} {...item} />
      ))}
    </div>
  );
}

CardView.propTypes = {
  items: PropTypes.arrayOf(PropTypes.object).isRequired,
  renderItem: PropTypes.func.isRequired,
};
