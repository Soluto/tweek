import React from 'react';
import RulesList from './RulesList/RulesList';

const isBrowser = typeof (window) === 'object';

export default ({valueType, mutate}) => isBrowser ?
  (<RulesList valueType={valueType} mutate={mutate.in("rules")} />) :
  (<div>Loading rule...</div>);