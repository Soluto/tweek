import { withState } from 'recompose'
import React from 'react'
import Autosuggest from 'react-autosuggest'

let defaultSuggestRenderer = (s)=>(<span>{s.label}</span>)

export default withState('tempValue', 'updateTempValue', null)(({
    tempValue, 
    updateTempValue, 
    inputProps:{ value, onChange, ...otherInputProps },
    suggestions,
    onSuggestionSelected,
    renderSuggestion,
    ...autosuggestProps })=>{ 
  renderSuggestion = renderSuggestion || defaultSuggestRenderer
  let getSuggestionValue = x=> (x && x.label !== null) ? x.label : x
  let getSuggestionByValue = val => suggestions.find(s=> getSuggestionValue(s) === val )
  tempValue = tempValue === null ? value : tempValue
  onSuggestionSelected = onSuggestionSelected || ((e, { suggestion, suggestionValue, sectionIndex, method })=> {
    onChange(suggestion)
  })
            
  return (<Autosuggest  className="OpDropdown"
            inputProps={{ ...otherInputProps,onChange:
                (e, { newValue })=>{
                  updateTempValue(newValue)
                },
            onBlur:(e)=>{
              let newValue = e.target.value
              let newSuggestion = getSuggestionByValue(newValue) || getSuggestionByValue(value)
              if (!newSuggestion) return 
              updateTempValue(getSuggestionValue(newSuggestion))
              if (newValue !== value) onChange(newSuggestion)
            },value: tempValue
            }}
            shouldRenderSuggestions={_=>true}
            onSuggestionSelected={onSuggestionSelected}
            
            {...{
              getSuggestionValue,
              suggestions,
              renderSuggestion,
              ...autosuggestProps
            }}
             
            />
            )
})
