import React from 'react';
import { Prompt } from 'react-router';

const routeLeaveHook = (fn, message, wrapperProps) => Component => props => (
    <div {...wrapperProps}>
        <Prompt message={message} when={fn(props)}/>
        <Component {...props}/>
    </div>
);

export default routeLeaveHook;
