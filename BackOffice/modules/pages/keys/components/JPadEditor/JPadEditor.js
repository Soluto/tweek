import React, {Component} from "react";
import R from "ramda";
import Rule from "./Rule";

import {Editor as EditorStyle} from "./JPadEditor.css";

export default ({source, mutate})=>{
    if (!source) return (<div/>);
    var rules = JSON.parse(source);
    return (<ul className={EditorStyle}>
        {rules.map( (rule, i)=><li key={rule.Id}><Rule mutate={mutate.in(i)} rule={rule} /></li>)}
    </ul>)
}