import React from 'react';

const wrapComponentWithClass = (Comp) => ({ className, ...props }) => (
  <div className={className}>
    <Comp {...props} />
  </div>
);

export default wrapComponentWithClass;
