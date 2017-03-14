import React from 'react';
import RulesList from './RulesList/RulesList';

const isBrowser = typeof (window) === 'object';

export default (props) => isBrowser ? <RulesList {...props} /> : <div>Loading rule...</div>