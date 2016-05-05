import React, {Component} from "react";
import R from "ramda";
import Select from 'react-select';
if (typeof(window) === "object"){
    require("react-select/dist/react-select.min.css");
}
import {Matcher as MatcherStyle, 
        Predicate as PredicateStyle,
        OpSelector as OpSelectorStyle,
        MatcherProperty as MatcherPropertyStyle,
        PropertySelector as PropertySelectorStyle} from "./JPadEditor.css";
        
import AutoSuggestService from "../../../../services/AutoSuggestService";
let autoSuggestService = new AutoSuggestService(); 
autoSuggestService.init();


const ops  = {"$eq": "=", "$ge": ">=", "$gt":">", "$lt": "<", "$le":"<=", "$ne":"!="};
 
let MatcherOp = ({selectedOp, onUpdate})=>
    (
        <Select 
    className={OpSelectorStyle}
    autosize={false}
    clearable={false}  
    value= {selectedOp}
    options={Object.keys(ops).map(op=>({ value: op, label: ops[op] }))}
    onChange={({value})=>onUpdate(value)}
     >
    
    </Select>)
    
let renderMatcherPredicate = ({predicate, mutate, property})=>{
    if (typeof(predicate) !== "object") return [<MatcherOp onUpdate={v=>{
        if (v!=="$eq"){
            mutate.updateValue({
                [v]: mutate.getValue()
            })
        } 
    }} selectedOp={"$eq"} />, 
    <input onChange={e=> mutate.updateValue(e.target.value)}  type="text" value={predicate} />];
    
    return R.toPairs(predicate)
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
                     <input type="text" onChange={e=> mutate.in(op).updateValue(e.target.value)} defaultValue={value} />]
                      : renderMatcherPredicate({predicate:value, mutate:mutate.in(op)})
                )
}

let Property = ({property, predicate, mutate, suggestedValues=[]})=> 
        (<div className={MatcherPropertyStyle}>
           <Select clearable={false} onChange={x=>
                    mutate
                        .updateKey(x.value)
                        .updateValue(x.meta.defaultValue === undefined ? "": x.meta.defaultValue)
                    }
                   className={PropertySelectorStyle} 
                   value={property} 
                   options={R.uniqBy(x=>x.value)([...suggestedValues, { value: property, label: R.last(property.split(".")) }])}>
             <option value={property}>{property}</option>
           </Select>
            {renderMatcherPredicate({predicate, mutate})}
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
                        autoSuggestService.getSuggestions({type:"MatcherProperty", query:{input:""}})
                        )
                        }
        key={i} {...{mutate:mutate.in(property),property,predicate}} />))
    }</div>)
}