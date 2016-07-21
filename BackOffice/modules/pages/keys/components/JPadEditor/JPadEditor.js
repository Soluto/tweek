import React from 'react';
import Rule from './Rule';
import { Editor as EditorStyle } from './JPadEditor.css';
import Chance from 'chance';
const isBrowser = typeof (window) === 'object';
const chance = new Chance();

export default ({ cases, mutate }) => {
    if (!cases) return (<div/>);
    return isBrowser ? (
        <div className={EditorStyle}>
            <button onClick={() =>
                mutate.prepend({ Id: chance.guid(), Matcher: {}, Value: '', Type: 'SingleVariant' })
            } >Add Case</button>
            {cases.map((rule, i) => (
                <div style={{ position: 'relative' }} disabled key={rule.Id}>
                    <div style={{
                        position: 'absolute',
                        top: 30,
                        right: 20,
                    }} >
                        {i > 0 ? <button onClick={() => mutate.replaceKeys(i, i - 1) }>&#8593; </button> : null}
                        {i < cases.length - 1 ? <button onClick={() => mutate.replaceKeys(i, i + 1) }>&#8595; </button> : null}
                        <button onClick={() => mutate.in(i).delete() }>X</button>
                    </div>
                    <Rule key={rule.Id} mutate={mutate.in(i) } rule={rule} /></div>)) }
        </div>
    ) : (<div>Loading rule...</div>);
};
