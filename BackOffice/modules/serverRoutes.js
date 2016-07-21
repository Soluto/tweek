import React from 'react';
import { ServerRoute } from 'react-project';
import getKey from './api/keys/getKey';
import updateKey from './api/keys/updateKey';

export default ({ rulesRepository, metaRepository }) => (
  <ServerRoute path="/api">
      <ServerRoute path="keys">
        <ServerRoute path="*"
          get={getKey}
          rulesRepository={rulesRepository}
          metaRepository={metaRepository}
          put={updateKey}
        />
      </ServerRoute>
    </ServerRoute>)
;
