import React from 'react';

const componentClassInjector = (Comp) => ({ className, ...props }) =>
(<div className={className}><Comp {...props} /></div>);

export default componentClassInjector;