import React from 'react'
import Rule from './Rule'
import Paper from 'material-ui/Paper'
import { ListItem } from 'material-ui/List'
import { Editor as EditorStyle } from './JPadEditor.css'
let isBrowser = typeof(window) === 'object'

export default ({ source, mutate })=>{
  if (!source) return (<div/>)
  let rules = JSON.parse(source)
  return isBrowser ? (<Paper className={EditorStyle}>
        {rules.map( (rule, i)=>(<ListItem disabled={true} key={rule.Id}><Rule mutate={mutate.in(i)} rule={rule} /></ListItem>))}
    </Paper>) : (<div>Loading rule...</div>)
}
