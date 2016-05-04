import React from 'react'
import { ServerRoute } from 'react-project'
import getKey from './api/keys/getKey'

export default (<ServerRoute path="/api">
      <ServerRoute path="keys">
        <ServerRoute path="*" get={getKey} />
      </ServerRoute>
    </ServerRoute>)