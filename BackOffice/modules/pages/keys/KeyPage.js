import React from "react";
import {Component} from "react";
import {connect} from "react-redux"
import getKey from "./actions/getKey"
import KeyMetaEditor from "./components/KeyMetaEditor"
import KeyRulesEditor from "./components/KeyRulesEditor"    


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
            <div>
            SelectedKey:{this.props.configKey}
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