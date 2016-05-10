import React, {Component} from "react";
import R from "ramda";
import {Checkbox} from 'material-ui';
import ClosedComboBox from "../../../../components/common/ClosedComboBox";
import {Matcher as MatcherStyle, 
        MatcherProperty as MatcherPropertyStyle,
        PropertySelector as PropertySelectorStyle} from "./JPadEditor.css";
        
import EditorMetaService from "../../../../services/EditorMetaService";
let editorMetaService = new EditorMetaService(); 
editorMetaService.init();

const ops  = {"$eq": "=", "$ge": ">=", "$gt":">", "$lt": "<", "$le":"<=", "$ne":"!="};

let MatcherOp = ({selectedOp, onUpdate})=>
        (<div className="MatcherOp">
            <ClosedComboBox className="OpDropdown"
         inputProps={{onChange:
             ({value})=>{
             onUpdate(value);
         }, value:ops[selectedOp] }} 
         suggestions={R.keys(ops).map(op=>({value:op,label:ops[op]}))} />
         </div>
        );
    
let PropertyValue = ({mutate, meta, value})=>{
    if (meta.type === "string"){
        if (meta.allowedValues){
            return (
                <ClosedComboBox  
                inputProps={{onChange:({value})=>mutate.updateValue(value), value}} 
                suggestions={meta.allowedValues.map(x=>({label:x, value:x}))} />
            )
        }
        else{
            return (<input type="text"  onChange={(e)=> mutate.updateValue(e.target.value)} value={value} />);    
        }
    }
    if (meta.type === "bool"){
        return (<Checkbox onCheck={(_,v)=>mutate.updateValue(v)}  checked={value} />);
    }
    return null;
}
    
let renderMatcherPredicate = ({predicate, mutate, property})=>{
    let meta = editorMetaService.getFieldMeta(property);
    if (typeof(predicate) !== "object") return [(meta.type === "bool" || meta.type === "empty") ? null : <MatcherOp onUpdate={v=>{
        if (v!=="$eq"){
            mutate.updateValue({
                [v]: mutate.getValue(),
                ...(meta.compare ? {$compare: meta.compare} : {})
            });
        } 
    }} selectedOp={"$eq"} />,  <PropertyValue {...{meta, mutate, value:predicate}} />]
    
    return R.flatten(R.toPairs(predicate)
                .filter(([key, _]) => key[0] === "$")
                .filter(([op, _]) => op !== "$compare")
                .map(([op, value])=> 
                     (typeof(value) !== "object") ? 
                     [<MatcherOp onUpdate={v=>{
                         if (v ==="$eq"){
                            mutate.updateValue(mutate.in(op).getValue())
                        }
                        else{
                            mutate.in(op).updateKey(v);
                        }
                     }} selectedOp={op} />, 
                     <PropertyValue {...{mutate:mutate.in(op), meta, value}}  />]
                      : renderMatcherPredicate({predicate:value, mutate:mutate.in(op), property})
    ));
}

let PropertySuggestion = ({suggestion})=>{
    var [identity, prop] = suggestion.value.split(".");
    var type = suggestion.meta && (suggestion.meta.typeAlias || suggestion.meta.type);
    return (<div>
                <span>{prop}</span><span style={{marginLeft:12, fontSize:12, color:"#00FF00"}}>({type})</span>
                <div style={{fontSize:14, color:"#AAAAAA"}}>{identity}</div>
            </div>)
}

let Property = ({property, predicate, mutate, suggestedValues=[]})=> 
        (<div className={MatcherPropertyStyle}>
           <div style={{color:"red", fontSize:"24px", lineHeight:"34px", cursor:"pointer"}} onClick={_=>mutate.delete()}>x</div>
             <ClosedComboBox  
                inputProps={{value:property === "" ? property : property.split(".")[1], onChange:(suggestion)=>
                     mutate
                        .updateKey(suggestion.value)
                        .updateValue((suggestion.meta && suggestion.meta.defaultValue) || "")
                }}
                renderSuggestion={ suggestion => (<PropertySuggestion suggestion={suggestion} />)}
                
                suggestions={R.uniqBy(x=>x.value)([...suggestedValues])} />
            {renderMatcherPredicate({predicate, mutate, property})}
        </div>) 

export default ({matcher, mutate}) =>{
    var [ops, props] = R.pipe(R.toPairs, R.partition(x=>x[0][0] === "$"))(matcher);
    let IgnoreActivePropsPropsPredicate = R.compose(R.not,R.contains(R.__, R.map(R.head, props)));
    let filterActiveProps = (currentProp)=> R.filter( R.pipe(R.prop("value"),
                                 R.either(R.equals(currentProp),IgnoreActivePropsPropsPredicate
                            )));

    return (<div className={MatcherStyle}>{
        props.map(([property, predicate], i)=> (<Property 
        suggestedValues={
                        filterActiveProps(property)(
                        editorMetaService.getSuggestions({type:"MatcherProperty", query:{input:""}})
                        )
                        }
        key={i} {...{mutate:mutate.in(property),property,predicate}} />))
    }
    <div style={{color:"blue", fontSize:"24px", lineHeight:"34px", cursor:"pointer"}} onClick={_=>mutate.insert("", "")}>+</div>
    </div>)
}