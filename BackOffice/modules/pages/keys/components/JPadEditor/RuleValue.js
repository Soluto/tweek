import React, { Component } from 'react'
import R from 'ramda'
import { Slider, TextField } from 'material-ui'

let SingleVariantValue = ({ value, onUpdate })=>(
    (<div><textarea value={value} onChange={e=>onUpdate(e.target.value) } /></div>)
)

let MultiVariantValue = ({ valueDistrubtion:{ type, args }, mutate })=>{
  if (type==='weighted')
    return (<div>
        {
            R.toPairs(args).map(([ value, weight ])=> (<div>{`${value}:${weight}`}</div>))
        }
        </div>)
  if (type === 'bernoulliTrial') {
    return (<div>
        <Slider value={args} 
        onChange={(_,v)=> mutate.in('args').updateValue(v)} /> 
        <span>{Math.round(args*100) + '%'}</span>
        </div>)
  }
  return null
}

export default ({ rule, mutate })=>{
  if (rule.Type === 'SingleVariant')
    return (<SingleVariantValue onUpdate={mutate.in('Value').updateValue} value={rule.Value} />)
  if (rule.Type === 'MultiVariant')
    return (<MultiVariantValue mutate={mutate.in('ValueDistribution')} valueDistrubtion={rule.ValueDistribution} />)
  return null
}
