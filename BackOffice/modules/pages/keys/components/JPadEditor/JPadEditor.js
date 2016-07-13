import React from 'react';
import Rule from './Rule';
import { Editor as EditorStyle } from './JPadEditor.css';
const isBrowser = typeof(window) === 'object';

export default ({ source, mutate }) => {
  if (!source) return (<div/>);
  const rules = JSON.parse(source);
  return isBrowser ? (<div className={EditorStyle}>
        {rules.map((rule, i) => (<div style={{ position: 'relative' }} disabled key={rule.Id}>
            <div style={{ position: 'absolute',
                        top: 30,
                        right: 20 }} >
            {i > 0 ? <button onClick={() => mutate.replaceKeys(i, i - 1)}>&#8593;</button> : null}
            {i < rules.length - 1 ? <button onClick={() => mutate.replaceKeys(i, i + 1)}>&#8595;</button> : null}
            <button onClick={() => mutate.in(i).delete()}>X</button>
            </div>
            <Rule mutate={mutate.in(i)} rule={rule} /></div>))}
    </div>) : (<div>Loading rule...</div>);
};
