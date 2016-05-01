import React from "react";
import {Component} from "react";
import {connect} from "react-redux"
import getKey from "./actions/getKey"
import KeyMetaEditor from "./components/KeyMetaEditor"
import KeyRulesEditor from "./components/KeyRulesEditor"    
import {KeyPage as KeyPageStyle} from "./styles.css";

export default connect( (state, {params} ) => ({...state, configKey:params.splat}) ) (class KeyPage extends Component
{
    constructor(props){
        super(props);
    }
    
    componentWillReceiveProps({configKey}){
        if (configKey != this.props.configKey) this.props.dispatch(getKey(configKey));
    }
    
    render(){
        return (
            <div className={KeyPageStyle}>
            <h3>{this.props.configKey}</h3>
            <div>{this.props.selectedKey ?
                <div>
                    <KeyMetaEditor meta={this.props.selectedKey.meta} />  
                    <KeyRulesEditor ruleDef={this.props.selectedKey.ruleDef} />
                </div> :
                 <div>loading...</div>
                }</div> 
            
            
            </div>
            
        )
    }
});