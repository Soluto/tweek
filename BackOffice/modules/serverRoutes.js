import React from 'react'
import hello from './api/hello'
import { ServerRoute } from 'react-project'
import getKey from './api/getKey'

export default (<ServerRoute path="/api">
      <ServerRoute path=":hello" get={hello}/>
      <ServerRoute path="keys">
        <ServerRoute path="*" get={getKey} />
      </ServerRoute>
    </ServerRoute>)