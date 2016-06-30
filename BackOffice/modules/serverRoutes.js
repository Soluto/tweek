import React from 'react'
import { ServerRoute } from 'react-project'
import getKey from './api/keys/getKey'
import updateKey from './api/keys/updateKey'

export default (<ServerRoute path="/api">
      <ServerRoute path="keys">
        <ServerRoute path="*" get={getKey} put={updateKey} />
      </ServerRoute>
    </ServerRoute>)