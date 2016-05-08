import React, {Component} from "react";
import R from "ramda";
import Select from 'react-select';
if (typeof(window) === "object"){
    require("react-select/dist/react-select.min.css");
}
import {TextField, Checkbox} from 'material-ui';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import {Dropdown, AutoSize, Combobox} from 'react-input-enhancements';

import {Matcher as MatcherStyle, 
        Predicate as PredicateStyle,
        MatcherProperty as MatcherPropertyStyle,
        PropertySelector as PropertySelectorStyle} from "./JPadEditor.css";
        
import EditorMetaService from "../../../../services/EditorMetaService";
let editorMetaService = new EditorMetaService(); 
editorMetaService.init();

const ops  = {"$eq": "=", "$ge": ">=", "$gt":">", "$lt": "<", "$le":"<=", "$ne":"!="};
 //onUpdate(value)}
 let MatcherOp = ({selectedOp, onUpdate})=>
    (
        <Combobox className="OpDropdown" value={selectedOp}
         autosize autocomplete defaultWidth={50} onValueChange={(v,_)=> onUpdate(v)} 
        options={R.keys(ops).map(op=>({value:op,label:ops[op]}))} >
          {({...inputProps, onChange}, { textValue }) =>
                        (<input type="text" {...inputProps}  />)
                    }  
        </Combobox>
        )
    
let PropertyValue = ({mutate, meta, value})=>{
    if (meta.type === "string"){
        if (meta.allowedValues){
            return (
                <Combobox onValueChange={(v,t)=> mutate.updateValue(v)} value={value}
                    options={meta.allowedValues}>
                    {({...inputProps, onChange}, { textValue }) =>
                        (<input type="text" key={mutate.path}  {...inputProps} />)
                    }
                    </Combobox>
                );
        }
        else{
            return (<input type="text" key={mutate.path} onChange={(e)=> mutate.updateValue(e.target.value)} value={value} />);    
        }
    }
    if (meta.type === "bool"){
        return (<Checkbox key={mutate.path} onCheck={(_,v)=>mutate.updateValue(v)}  defaultChecked={value} />);
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
                     <PropertyValue {...{mutate:mutate.in(op), meta, value}}  />]
                      : renderMatcherPredicate({predicate:value, mutate:mutate.in(op), property})
                )
}

let Property = ({property, predicate, mutate, suggestedValues=[]})=> 
        (<div className={MatcherPropertyStyle}>
           <div style={{color:"red", fontSize:"24px", lineHeight:"34px", cursor:"pointer"}} onClick={_=>mutate.delete()}>x</div>
           <Combobox autocomplete onValueChange={(x)=>{
                   mutate
                        .updateKey(x)
                        .updateValue( (suggestedValues.find(s=>s.value===x).meta.defaultValue || ""))
                    }
                   }
                   className={PropertySelectorStyle} 
                   value={property} 
                   options={R.uniqBy(x=>x.value)([...suggestedValues, { value: property, label: R.last(property.split(".")) }])}>
             {({...inputProps, onChange}, { textValue }) =>
                        (<input type="text" key={mutate.path}  {...inputProps} />)
                    }
           </Combobox>
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