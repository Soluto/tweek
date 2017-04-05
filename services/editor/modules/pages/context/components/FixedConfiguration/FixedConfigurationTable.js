import React, { PropTypes } from 'react';

const FixedConfigurationTable = ({ fixedConfigurations }) => {
  return (
    <div style={ style.container }>{
      Object.keys(fixedConfigurations).map(key => <div style={ style.row } key={ key }>
        <div style={ style.col }>{ key }</div>
        <div style={ style.col }>{ fixedConfigurations[key] }</div>
      </div>)
    }</div>
  )
}

FixedConfigurationTable.propTypes = {
  fixedConfigurations: PropTypes.object.isRequired
}

const style = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    width: '600px'
  },

  row: {
    display: 'flex',
    flexDirection: 'row',

    marginTop: '10px'
  },

  col: {
    flex: 1
  }
}

export default FixedConfigurationTable;

