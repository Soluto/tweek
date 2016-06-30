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
        {rules.map( (rule, i)=>(<ListItem disabled={true} key={rule.Id}>
            <div style={{ position:'absolute',
                        top: 30,
                        right: 20 }} >
            {i > 0 ? <button onClick={()=>mutate.replaceKeys(i, i-1)}>&#8593;</button> : null}
            {i < rules.length-1 ? <button onClick={()=>mutate.replaceKeys(i, i+1)}>&#8595;</button> : null}
            </div>
            <Rule mutate={mutate.in(i)} rule={rule} /></ListItem>))}
    </Paper>) : (<div>Loading rule...</div>)
}
