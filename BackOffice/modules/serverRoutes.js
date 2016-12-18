import React from 'react';
import { ServerRoute } from 'react-project';
import getKey from './api/keys/getKey';
import putKey from './api/keys/putKey';
import deleteKey from './api/keys/deleteKey';
import getTags from './api/tags/getTags';
import putTags from './api/tags/putTags';

export default ({ gitTransactionManager }) => (
  <ServerRoute path="/api">
    <ServerRoute path="tags"
                 get={getTags}
                 put={putTags}
                 gitTransactionManager={gitTransactionManager}
    />
    <ServerRoute path="keys">
      <ServerRoute path="*"
                   get={getKey}
                   put={putKey}
                   delete={deleteKey}
                   gitTransactionManager={gitTransactionManager}
      />
    </ServerRoute>
  </ServerRoute>)
;
