import React from 'react';
import { ServerRoute } from 'react-project';
import getKey from './api/keys/getKey';
import putKey from './api/keys/putKey';

export default ({ rulesRepository, metaRepository }) => (
  <ServerRoute path="/api">
    <ServerRoute path="keys">
      <ServerRoute path="*"
        get={getKey}
        rulesRepository={rulesRepository}
        metaRepository={metaRepository}
        put={putKey}
      />
    </ServerRoute>
  </ServerRoute>)
  ;
