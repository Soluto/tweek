import React from 'react';
import { ServerRoute } from 'react-project';
import getKey from './api/keys/getKey';
import updateKey from './api/keys/updateKey';

export default ({ repo }) => (<ServerRoute path="/api">
      <ServerRoute path="keys">
        <ServerRoute path="*" get={getKey} repo={repo} put={updateKey} />
      </ServerRoute>
    </ServerRoute>)
;
