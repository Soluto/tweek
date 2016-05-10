import {withState} from "recompose"
import React from "react";
import Autosuggest from "react-autosuggest";

let defaultSuggestRenderer = (s)=>(<span>{s.label}</span>)

export default withState("tempValue", "updateTempValue", null)(({
    tempValue, 
    updateTempValue, 
    inputProps:{value, onChange, onBlur, ...otherInputProps},
    suggestions,
    onSuggestionSelected,
    renderSuggestion,
    ...autosuggestProps})=>
        { 
            renderSuggestion = renderSuggestion || defaultSuggestRenderer;
            let getSuggestionValue = x=> (x && x.label) || x;
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
                if (!newSuggestion) return; 
                updateTempValue(getSuggestionValue(newSuggestion));
                onChange(newSuggestion);
            },value: tempValue
            }}
            onSuggestionSelected={onSuggestionSelected}
            
            {...{
                getSuggestionValue,
                suggestions,
                renderSuggestion,
                ...autosuggestProps
            }}
             
            />
            )
        });