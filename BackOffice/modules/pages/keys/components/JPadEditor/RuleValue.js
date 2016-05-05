import React, {Component} from "react";
import R from "ramda";

let SingleVariantValue = ({value, onUpdate})=>(
    (<div><textarea defaultValue={value} onChange={e=>onUpdate(e.target.value) } /></div>)
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

let MultiVariantValue = ({valueDistrubtion:{type, args}, mutate})=>{
     if (type==="weighted")
        return (<div>
        {
            R.toPairs(args).map(([value, weight])=> (<div>{`${value}:${weight}`}</div>))
        }
        </div>)
    if (type === "bernoulliTrial"){
        return (<div>
        <input type="range" min="0" max="100" 
        onChange={e=>mutate.in("args").updateValue(parseFloat("0." + e.target.value))} 
        defaultValue={Math.round(args*100)} />
        <span>{Math.round(args*100) + "%"}</span>
        </div>)
    }
    return null;
}

export default ({rule, mutate})=>{
    if (rule.Type === "SingleVariant")
        return (<SingleVariantValue onUpdate={mutate.in("Value").updateValue} value={rule.Value} />)
    if (rule.Type === "MultiVariant")
        return (<MultiVariantValue mutate={mutate.in("ValueDistribution")} valueDistrubtion={rule.ValueDistribution} />)
    return null;
}
