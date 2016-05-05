import React, {Component} from "react";
import R from "ramda";
import Rule from "./Rule";
import Divider from 'material-ui/Divider';
import Paper from 'material-ui/Paper';
import {List, ListItem} from 'material-ui/List';

import {Editor as EditorStyle} from "./JPadEditor.css";

export default ({source, mutate})=>{
    if (!source) return (<div/>);
    var rules = JSON.parse(source);
    return (<Paper className={EditorStyle}>
        {rules.map( (rule, i)=>(<ListItem disabled={true} key={rule.Id}><Rule mutate={mutate.in(i)} rule={rule} /></ListItem>))}
    </Paper>)
}