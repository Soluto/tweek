import React, {Component} from "react";
import R from "ramda";
import {Checkbox} from 'material-ui';
import Autosuggest from 'react-autosuggest';
import {withState} from "recompose"

import {Matcher as MatcherStyle, 
        MatcherProperty as MatcherPropertyStyle,
        PropertySelector as PropertySelectorStyle} from "./JPadEditor.css";
        
import EditorMetaService from "../../../../services/EditorMetaService";
let editorMetaService = new EditorMetaService(); 
editorMetaService.init();

let defaultSuggestRenderer = (s)=>(<span>{s.label}</span>)
const ops  = {"$eq": "=", "$ge": ">=", "$gt":">", "$lt": "<", "$le":"<=", "$ne":"!="};

        
let ClosedComboBox = withState("tempValue", "updateTempValue", null)(({
    tempValue, 
    updateTempValue, 
    inputProps:{value, onChange, onBlur, ...otherInputProps},
    suggestions,
    onSuggestionSelected,
    ...autosuggestProps})=>
        {
            let getSuggestionValue = x=>x.label;
            let getSuggestionByValue = val => suggestions.find(s=> getSuggestionValue(s) == val );
            tempValue = tempValue === null ? value : tempValue;
            onSuggestionSelected = onSuggestionSelected || ((e, { suggestion, suggestionValue, sectionIndex, method })=> {
                onChange(suggestion);
            });
            
            return (<Autosuggest  className="OpDropdown"
            inputProps={{...otherInputProps,onChange:
                (e, {newValue})=>{
                updateTempValue(newValue);
                var suggestion = getSuggestionByValue(newValue);
                if (suggestion) {onChange(suggestion)};
            },
            onBlur:(e)=>{
                var newValue = e.target.value;
                var newSuggestion = getSuggestionByValue(newValue) || getSuggestionByValue(value); 
                updateTempValue(getSuggestionValue(newSuggestion));
                onChange(newSuggestion);
            },value: tempValue
            }}
            onSuggestionSelected={onSuggestionSelected}
            
            {...{
                getSuggestionValue,
                suggestions,
                ...autosuggestProps
            }}
             
            />
            )
        });
        

let MatcherOp = ({selectedOp, onUpdate})=>
        (<div className="MatcherOp">
            <ClosedComboBox className="OpDropdown"
         inputProps={{onChange:
             ({value})=>{
             onUpdate(value);
         }, value:ops[selectedOp] }}
         renderSuggestion={defaultSuggestRenderer} 
         suggestions={R.keys(ops).map(op=>({value:op,label:ops[op]}))} />
         </div>
        );
    
let PropertyValue = ({mutate, meta, value})=>{
    if (meta.type === "string"){
        if (meta.allowedValues){
            return (
                <ClosedComboBox  
                inputProps={{onChange:(e, {newValue})=>mutate.updateValue(newValue), value}}
                renderSuggestion={x=>(<span>{x}</span>)}
                getSuggestionValue={x=>x} 
                suggestions={meta.allowedValues} />
            )
        }
        else{
            return (<input type="text"  onChange={(e)=> mutate.updateValue(e.target.value)} value={value} />);    
        }
    }
    if (meta.type === "bool"){
        return (<Checkbox onCheck={(_,v)=>mutate.updateValue(v)}  defaultChecked={value} />);
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
                inputProps={{value:property.split(".")[1], onChange:(suggestion)=>
                     mutate
                        .updateKey(suggestion.value)
                        .updateValue((suggestion.meta && suggestion.meta.defaultValue) || "")
                }}
                renderSuggestion={ suggestion => (<PropertySuggestion suggestion={suggestion} />)}
                
                suggestions={R.uniqBy(x=>x.value)([...suggestedValues, { value: property, label: R.last(property.split(".")) }])} />
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