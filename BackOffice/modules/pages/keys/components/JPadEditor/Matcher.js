import React from 'react'
import R from 'ramda'
import ClosedComboBox from '../../../../components/common/ClosedComboBox'
import { Matcher as MatcherStyle, 
        MatcherProperty as MatcherPropertyStyle } from './JPadEditor.css'
        
import EditorMetaService from '../../../../services/EditorMetaService'
let editorMetaService = new EditorMetaService() 
editorMetaService.init()
let equalityOps = { '$eq': '=', '$ne':'!=' }
let comparisonOps = { '$ge': '>=', '$gt':'>', '$lt': '<', '$le':'<=', ...equalityOps }

let getSupportedOps = (meta)=>{
  if (meta.type.bool) return equalityOps
  if (meta.allowedValues) return equalityOps
  return comparisonOps
}

let MatcherOp = ({ selectedOp, onUpdate, supportedOps })=>
        (<div className="MatcherOp">
            <ClosedComboBox className="OpDropdown"
         inputProps={{ onChange:
             ({ value })=>{
               onUpdate(value)
             }, value:supportedOps[selectedOp] }} 
         suggestions={R.keys(supportedOps).map(op=>({ value:op,label:supportedOps[op] }))} />
         </div>
        )
    
let PropertyValue = ({ onUpdate, meta, value })=>{
  return meta.allowedValues 
    ? (
          <ClosedComboBox  
          inputProps={{ onChange:({ value })=>onUpdate(value), value }} 
          suggestions={meta.allowedValues} />
      )
    : (<input type="text"  onChange={(e)=> onUpdate(e.target.value)} value={value} />)
  
}

let EmptyPredicate = ()=> null

let BinaryPredicate = ({ onValueUpdate, onOpUpdate, op, meta, value })=> (<div style={{ display: 'flex' }}>
  <MatcherOp onUpdate={onOpUpdate} supportedOps={getSupportedOps(meta)}  selectedOp={op} />
    <PropertyValue {...{ meta, value, onUpdate:onValueUpdate }} /> 
  </div>)


let ShortPredicate = ({ meta, mutate, value })=>{
  if (meta.type === 'empty') return <EmptyPredicate/>
  return (<BinaryPredicate 
  onValueUpdate={mutate.updateValue}
  onOpUpdate={selectedOp=>{
    if (selectedOp==='$eq') return
    mutate.updateValue({
      [selectedOp]: mutate.getValue(),
      ...(meta.compare ? { $compare: meta.compare } : {})
    }) 
  }} op="$eq" {...{ value, meta }} />)
}

let ComplexPredicate = ({ predicate, mutate, property, meta }) =>{
  return (<div style={{ display: 'flex' }}>{ 
                R.flatten(R.toPairs(predicate)
                .filter(([ key ]) => key[0] === '$')
                .filter(([ op ]) => op !== '$compare')
                .map(([ op, value ])=> 
                     (typeof(value) !== 'object') ? 
                     <BinaryPredicate key={op}
                     onOpUpdate={selectedOp=>{
                       if (selectedOp ==='$eq') mutate.updateValue(mutate.in(op).getValue())
                       else mutate.in(op).updateKey(selectedOp)
                     }}
                     onUpdate={mutate.in(op).updateValue} {...{ value, op, meta }} />
                     : renderMatcherPredicate({ predicate:value, mutate:mutate.in(op), property })
    ))
  }</div>)
}
    
let renderMatcherPredicate = ({ predicate, mutate, property })=>{
  let meta = editorMetaService.getFieldMeta(property)
  if (typeof(predicate) !== 'object') return <ShortPredicate value={predicate} {...{ meta, mutate } } /> 
    
  return <ComplexPredicate {...{ predicate , mutate, property, meta }} />
}

let PropertySuggestion = ({ suggestion })=>{
  const [ identity, prop ] = suggestion.value.split('.')
  const type = suggestion.meta && (suggestion.meta.typeAlias || suggestion.meta.type)
  return (<div>
                <span>{prop}</span><span style={{ marginLeft:12, fontSize:12, color:'#00FF00' }}>({type})</span>
                <div style={{ fontSize:14, color:'#AAAAAA' }}>{identity}</div>
            </div>)
}

let getPropertyDisplayName = prop => prop === '' ? prop : prop.split('.')[1]


let Property = ({ property, predicate, mutate, suggestedValues=[] })=> 
        (<div className={MatcherPropertyStyle}>
           <div style={{ color:'red', fontSize:'24px', lineHeight:'34px', cursor:'pointer' }} onClick={mutate.delete}>x</div>
             <ClosedComboBox  
                inputProps={{ 
                  value: getPropertyDisplayName(property),
                  onChange:(selectedOption)=>
                     mutate
                        .updateKey(selectedOption.value)
                        .updateValue((selectedOption.meta && selectedOption.meta.defaultValue) || '')
                }}
                renderSuggestion={ suggestion => (<PropertySuggestion suggestion={suggestion} />)}
                
                suggestions={R.uniqBy(x=>x.value)([ ...suggestedValues ])} />
            {renderMatcherPredicate({ predicate, mutate, property })}
        </div>) 

export default ({ matcher, mutate }) =>{
  const [ ops, props ] = R.pipe(R.toPairs, R.partition(([ prop ])=>prop[0] === '$'))(matcher)
  let IgnoreActivePropsPropsPredicate = R.compose(R.not,R.contains(R.__, R.map(R.head, props)))
  
  let filterActiveProps = (currentProp)=> (propsWithMeta)=> 
                                  propsWithMeta.filter(x=>x.value === currentProp || IgnoreActivePropsPropsPredicate(x.value))

  return (<div className={MatcherStyle}>
  {
        props.map(([ property, predicate ], i)=> {
          const allSuggestions = editorMetaService.getSuggestions({ type:'MatcherProperty', query:{ input:'' } })
          const suggestedValues =  filterActiveProps(property)(allSuggestions)
          return (
            <Property mutate={mutate.in(property)} key={i} 
            {...{ suggestedValues, property,predicate }} />
          ) })
    }
    <div style={{ color:'blue', fontSize:'24px', lineHeight:'34px', cursor:'pointer' }} onClick={()=>mutate.insert('', '')}>+</div>
    </div>)
}
