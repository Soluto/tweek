import React from 'react'
import ClosedComboBox from '../../../../../components/common/ClosedComboBox'

export default ({ onUpdate, meta, value })=>{
  return meta.allowedValues 
    ? (
          <ClosedComboBox  
          inputProps={{ onChange:({ value })=>onUpdate(value), value }} 
          suggestions={meta.allowedValues} />
      )
    : (<input type="text"  onChange={(e)=> onUpdate(e.target.value)} value={value} />)
}
