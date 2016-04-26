import React from "react";
import R from "ramda";
import {Rule as RuleStyle, 
        Matcher as MatcherStyle, 
        Predicate as PredicateStyle,
        OpSelector as OpSelectorStyle,
        MatcherProperty as MatcherPropertyStyle,
        JPadViewer as JPadViewerStyle,
        PropertySelector as PropertySelectorStyle} from "./RulesEditor.css";
       
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

let PropertyPredicate = ({op, value})=>(
       <div className={PredicateStyle} >
        <MatcherOp selectedOp={op} />
        <input defaultValue={value} />
       </div>
    )
    
let renderMatcherPredicate = (predicate)=>{
    predicate = (typeof(predicate) !== "object") ? {"$eq": predicate} : predicate;
    
    return R.toPairs(predicate)
                .filter(([key, _]) => key[0] === "$")
                .filter(([op, _]) => op !== "$compare")
                .map(([op, value])=> 
                     (typeof(value) !== "object") ? <PropertyPredicate op={op} value={value} /> : renderMatcherPredicate(value)
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

let JPadRule = ({rule})=>{
    return (<div className={RuleStyle}>
       {renderMatcher(rule.Matcher)}
       {rule.Value || ""}
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
     <JPadViewer source={ruleDef.source} />
    <code>
    {ruleDef.source}
    </code>
    </div>
)