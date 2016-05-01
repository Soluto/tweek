import React from "react";
import R from "ramda";
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

var getActiveIdentities = R.pipe(R.unfold( 
    (m)=> {
       if ( typeof(m) !== "object" || R.isEmpty(m)  ) return false;
       if (!R.isArrayLike(m)){
           return [[], R.toPairs(m)];
       }
       else{
           return R.pipe(R.partition(x=>x[0][0] !== "$"),
                  ([values, ops])=> 
                  [R.map(R.pipe(R.head, R.split("."), R.head))(values),
                  ...R.pipe(R.pluck(1), R.map(R.toPairs))(ops)])(m);
       }
    }), R.flatten, R.uniq)


const ops  = {"$eq": "=", "$ge": ">=", "$gt":">", "$lt": "<", "$le":"<=", "$ne":"!="};

    
let MatcherOp = ({selectedOp})=>
    (<Select 
    className={OpSelectorStyle}
    autosize={false}
    clearable={false}  
    value= {selectedOp}
    options={Object.keys(ops).map(op=>({ value: op, label: ops[op] }))}
    onChange={x=>console.log(x)}
     >
    
    </Select>)

let renderMatcherPredicate = (predicate)=>{
    predicate = (typeof(predicate) !== "object") ? {"$eq": predicate} : predicate;
    
    return R.toPairs(predicate)
                .filter(([key, _]) => key[0] === "$")
                .filter(([op, _]) => op !== "$compare")
                .map(([op, value])=> 
                     (typeof(value) !== "object") ? 
                     [<MatcherOp selectedOp={op} />, <input type="text" defaultValue={value} />]
                      : renderMatcherPredicate(value)
                )
}

let renderMatcher = matcher =>{
    var [ops, props] = R.pipe(R.toPairs, R.partition(x=>x[0][0] === "$"))(matcher);
    let Property = ({property, predicate})=> 
        (<div className={MatcherPropertyStyle}>
           <Select clearable={false} className={PropertySelectorStyle} value={property} options={[{ value: property, label: R.last(property.split(".")) }]}>
             <option value={property}>{property}</option>
           </Select>
            {renderMatcherPredicate(predicate)}
        </div>) 
    
    return (<div className={MatcherStyle}>{props.map(x=> (<Property property={x[0]} predicate={x[1]} />))}</div>)
}

let SingleVariantValue = ({value})=>(
    (<div><textarea defaultValue={value} /></div>)
)

let renderValueDistrubtion = (values)=>{
    if (values.type=="weighted")
        return (<div>
        {
            R.toPairs(values.args).map(([value, weight])=> (<div>{`${value}:${weight}`}</div>))
        }
        </div>)
    return "";
}

let MultiVariantValue = ({valueDistrubtion})=>(
    (<div>
    {R.toPairs(valueDistrubtion).map(([date, values])=>(
        (<div>
        <div>{date}</div>
        {renderValueDistrubtion(values)}
        </div>)    
    ))}
    </div>)
    
)

let renderRuleValue = (rule)=>{
    if (rule.Type === "SingleVariant")
        return (<SingleVariantValue value ={rule.Value} />)
    if (rule.Type === "MultiVariant")
        return (<MultiVariantValue valueDistrubtion={rule.ValueDistribution} />)
    return "";
}

let JPadRule = ({rule})=>{
    return (<div className={RuleStyle}>
       <div className={PanelStyle} data-label="Conditions">{renderMatcher(rule.Matcher)}</div>
       <div className={PanelStyle} data-label="Values">{renderRuleValue(rule)}</div>
    </div>)
}

let JPadViewer = ({source})=>{
    if (!source) return (<div/>);
    var rules = JSON.parse(source);
    return (<ul className={JPadViewerStyle}>
        {rules.map(rule=><li><JPadRule rule={rule} /></li>)}
    </ul>)
    
}

export default ({ruleDef})=>(
    <div>
    <Tabs selectedIndex={0}>
        <TabList>
            <Tab>Rule</Tab>
            <Tab>Source</Tab>
        </TabList>
         <TabPanel>
          <JPadViewer source={ruleDef.source} />
        </TabPanel>
        <TabPanel>
          <pre>
            {JSON.stringify(JSON.parse(ruleDef.source), null, 4)}
            </pre>
        </TabPanel>
    </Tabs>
    </div>
)