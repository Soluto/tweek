import React, {Component} from "react";
import R from "ramda";
import {shouldUpdate} from "recompose";
import {Rule as RuleStyle, 
        Panel as PanelStyle} from "./JPadEditor.css";
import Matcher from "./Matcher";
import RuleValue from "./RuleValue";

export default shouldUpdate((props, nextProps )=>{
    return !(R.equals(props.rule, nextProps.rule) && R.equals(props.mutate.path, nextProps.mutate.path))
})(({rule, mutate})=>{
    return (<div className={RuleStyle}>
       <div className={PanelStyle} data-label="Conditions">
            <Matcher matcher={rule.Matcher} mutate={mutate.in("Matcher")} />
            </div>
       <div className={PanelStyle} data-label="Values"><RuleValue {...{rule, mutate}} /></div>
    </div>)
});