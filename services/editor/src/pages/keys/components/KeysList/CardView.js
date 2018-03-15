import React from 'react';
import PropTypes from 'prop-types';

export default function CardView({ items, renderItem, expandByDefault }) {
  let Card = renderItem;
  return <div className="card-results">{items.map(item => <Card {...item} />)}</div>;
}

CardView.propTypes = {
  items: PropTypes.arrayOf(PropTypes.object).isRequired,
  renderItem: PropTypes.func.isRequired,
};
