import React from "react";
import {Component} from "react";
import {getKeys} from "./actions/getKeys"
import {connect} from "react-redux" 
import KeysList from "./components/KeysList";
import {KeyPages as KeyPagesStyle} from "./styles.css";

export default connect( state => state)(class KeysPage extends Component
{
    constructor(props){
        super(props);
    }
    
    componentDidMount(){
        if (!this.props.keys){
            this.props.dispatch(getKeys());
        }
    }
    
    render(){
        return (
            <div className={KeyPagesStyle}>
            <KeysList keys={this.props.keys}></KeysList>
            {this.props.children}
            </div>
        )
    }
});