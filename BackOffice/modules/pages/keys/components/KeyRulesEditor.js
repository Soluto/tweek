import React, {Component} from "react";
import R from "ramda";
import {shouldUpdate} from "recompose";
import {Rule as RuleStyle, 
        Matcher as MatcherStyle, 
        Predicate as PredicateStyle,
        OpSelector as OpSelectorStyle,
        MatcherProperty as MatcherPropertyStyle,
        Panel as PanelStyle,
        JPadViewer as JPadViewerStyle,
        PropertySelector as PropertySelectorStyle} from "./RulesEditor.css";

import {Tab, Tabs, TabList, TabPanel} from 'react-tabs';

import Select from 'react-select';
if (typeof(window) === "object"){
    require("react-select/dist/react-select.min.css");
}
    
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


let SingleVariantValue = ({value, onupdate})=>(
    (<div><textarea defaultValue={value} onChange={e=>onupdate(e.target.value) } /></div>)
)

let ValueDistrubtion = ({values, mutate})=>{
    if (values.type==="weighted")
        return (<div>
        {
            R.toPairs(values.args).map(([value, weight])=> (<div>{`${value}:${weight}`}</div>))
        }
        </div>)
    if (values.type === "bernoulliTrial"){
        return (<div>
        <input type="range" min="0" max="100" 
        onChange={e=>mutate.in("args").updateValue(parseFloat("0." + e.target.value))} 
        defaultValue={Math.round(values.args*100)} />
        <span>{Math.round(values.args*100) + "%"}</span>
        </div>)
    }
    return null;
}

let MultiVariantValue = ({valueDistrubtion, mutate})=>(
    (<div>
    {R.toPairs(valueDistrubtion).map(([date, values], i)=>(
        (<div key={i}>
        <div>{date}</div>
        <ValueDistrubtion values={values} mutate={mutate.in(date)} />
        </div>)    
    ))}
    </div>)
    
)

let RuleValue = ({rule, mutate})=>{
    if (rule.Type === "SingleVariant")
        return (<SingleVariantValue onupdate={mutate.in("Value").updateValue} value={rule.Value} />)
    if (rule.Type === "MultiVariant")
        return (<MultiVariantValue mutate={mutate.in("ValueDistribution")} valueDistrubtion={rule.ValueDistribution} />)
    return null;
}

let renderMatcherPredicate = ({predicate, mutate})=>{
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

let Property = ({property, predicate, mutate})=> 
        (<div className={MatcherPropertyStyle}>
           <Select clearable={false} className={PropertySelectorStyle} value={property} options={[{ value: property, label: R.last(property.split(".")) }]}>
             <option value={property}>{property}</option>
           </Select>
            {renderMatcherPredicate({predicate, mutate:mutate.in(property)})}
        </div>) 

let Matcher = ({matcher, mutate}) =>{
    var [ops, props] = R.pipe(R.toPairs, R.partition(x=>x[0][0] === "$"))(matcher);
    return (<div className={MatcherStyle}>{
        props.map(([property, predicate], i)=> (<Property key={i} {...{mutate,property,predicate}} />))
    }</div>)
}

let JPadRule = shouldUpdate((props, nextProps )=>{
    return !(R.equals(props.rule, nextProps.rule) && R.equals(props.mutate.path, nextProps.mutate.path))
})(({rule, mutate})=>{
    return (<div className={RuleStyle}>
       <div className={PanelStyle} data-label="Conditions">
            <Matcher matcher={rule.Matcher} mutate={mutate.in("Matcher")} />
            </div>
       <div className={PanelStyle} data-label="Values"><RuleValue {...{rule, mutate}} /></div>
    </div>)
});

let JPadViewer = ({source, mutate})=>{
    if (!source) return (<div/>);
    var rules = JSON.parse(source);
    return (<ul className={JPadViewerStyle}>
        {rules.map( (rule, i)=><li key={rule.Id}><JPadRule mutate={mutate.in(i)} rule={rule} /></li>)}
    </ul>)
}

let createMutator = (sourceTree, callback, path=[])=>{
    return {
        in(innerPath){return createMutator(sourceTree, callback, [...path, innerPath])},
        getValue(){
            var [innerPath, key] = R.splitAt(-1,path);
            return R.reduce((acc,x)=>acc[x], sourceTree, innerPath)[key];
        },
        updateValue(newValue){
            console.log(`updating value:${path}`);
            var clonedTree = R.clone(sourceTree);
            var [innerPath, key] = R.splitAt(-1,path);
            R.reduce((acc,x)=>acc[x], clonedTree, innerPath)[key] = newValue;
            callback(clonedTree);
        },
        updateKey(newKey){
            console.log(`updating key:${path}`);
            var clonedTree = R.clone(sourceTree);
            var [innerPath, key] = R.splitAt(-1,path);
            var root = R.reduce((acc,x)=>acc[x], clonedTree, innerPath);
            root[newKey] = root[key];
            delete root[key];
            callback(clonedTree);
        },
        path
    }
}

export default ({ruleDef, updateRule})=>(
    <div>
    <Tabs selectedIndex={0}>
        <TabList>
            <Tab>Rule</Tab>
            <Tab>Source</Tab>
        </TabList>
         <TabPanel>
          <JPadViewer source={ruleDef.source} 
          mutate={createMutator(JSON.parse(ruleDef.source),
                 (sourceTree)=>updateRule({...ruleDef, source: JSON.stringify(sourceTree) }) )} />
        </TabPanel>
        <TabPanel>
          <pre>
            {JSON.stringify(JSON.parse(ruleDef.source), null, 4)}
            </pre>
        </TabPanel>
    </Tabs>
    </div>
)