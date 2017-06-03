import React from 'react';
import { Prompt } from 'react-router';

const routeLeaveHook = (fn, message) => Component => props => (
    <div>
        <Prompt message={message} when={fn(props)}/>
        <Component {...props}/>
    </div>
);

export default routeLeaveHook;
